import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { Budget } from "@/pages/Budget";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0, "Amount must be positive"),
  period: z.enum(["monthly", "quarterly", "yearly"]),
  carry_forward: z.boolean(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
  onSuccess: () => void;
  monthlyIncome: number;
  totalBudget: number;
}

export function BudgetForm({
  open,
  onOpenChange,
  budget,
  onSuccess,
  monthlyIncome,
  totalBudget,
}: BudgetFormProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget || {
      category: "",
      amount: 0,
      period: "monthly",
      carry_forward: false,
    },
  });

  const currentAmount = watch("amount");
  const willExceedIncome = !budget 
    ? (totalBudget + currentAmount > monthlyIncome && monthlyIncome > 0) 
    : ((totalBudget - (budget?.amount || 0) + currentAmount) > monthlyIncome && monthlyIncome > 0);
  
  const exceedAmount = !budget 
    ? (totalBudget + currentAmount - monthlyIncome) 
    : ((totalBudget - (budget?.amount || 0) + currentAmount) - monthlyIncome);

  const onSubmit = async (formData: BudgetFormData) => {
    if (!user) return;
    
    if (willExceedIncome) {
      return;
    }
    
    try {
      const budgetData = {
        amount: formData.amount,
        category: formData.category,
        period: formData.period,
        carry_forward: formData.carry_forward,
        user_id: user.id,
      };

      if (budget) {
        const { error } = await supabase
          .from("budgets")
          .update(budgetData)
          .eq("id", budget.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("budgets")
          .insert(budgetData);
        if (error) throw error;
      }
      reset();
      onSuccess();
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[90%] rounded-t-2xl" : ""}>
        <SheetHeader>
          <SheetTitle>{budget ? "Edit" : "Create"} Budget</SheetTitle>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" />
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-6 budget-form-container">
          {willExceedIncome && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: Your total budget will exceed your monthly income by {formatCurrency(exceedAmount)}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch("category")}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORY_COLORS).map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" 
                           style={{ backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] }}></div>
                      {category}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
              className="text-base"
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Budget Period</Label>
            <Select
              value={watch("period")}
              onValueChange={(value: "monthly" | "quarterly" | "yearly") =>
                setValue("period", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {errors.period && (
              <p className="text-xs text-red-500 mt-1">{errors.period.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
            <Label htmlFor="carry_forward" className="flex-1 cursor-pointer">
              Carry Forward Unused Amount
            </Label>
            <Switch
              id="carry_forward"
              checked={watch("carry_forward")}
              onCheckedChange={(checked) => setValue("carry_forward", checked)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <SheetClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </SheetClose>
            <Button 
              type="submit"
              disabled={willExceedIncome}
            >
              {budget ? "Update" : "Create"} Budget
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
