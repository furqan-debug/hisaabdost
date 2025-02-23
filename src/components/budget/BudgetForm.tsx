
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { Budget } from "@/pages/Budget";
import { supabase } from "@/integrations/supabase/client";

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
}

export function BudgetForm({
  open,
  onOpenChange,
  budget,
  onSuccess,
}: BudgetFormProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget || {
      category: "",
      amount: 0,
      period: "monthly",
      carry_forward: false,
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    try {
      if (budget) {
        const { error } = await supabase
          .from("budgets")
          .update(data)
          .eq("id", budget.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("budgets").insert([data]);
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{budget ? "Edit" : "New"} Budget</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-8">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch("category")}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORY_COLORS).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              value={watch("period")}
              onValueChange={(value: "monthly" | "quarterly" | "yearly") =>
                setValue("period", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="carry_forward">Carry Forward Unused Amount</Label>
            <Switch
              id="carry_forward"
              checked={watch("carry_forward")}
              onCheckedChange={(checked) => setValue("carry_forward", checked)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
