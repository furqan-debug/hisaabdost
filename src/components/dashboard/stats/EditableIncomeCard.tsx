
import React from "react";
import { StatCard } from "./StatCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { PercentageChange } from "./PercentageChange";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CurrencyCode } from "@/utils/currencyUtils";
import { Pencil } from "lucide-react";

interface EditableIncomeCardProps {
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  percentageChange: number;
  formatCurrency: (value: number, currencyCode: CurrencyCode) => string;
  currencyCode: CurrencyCode;
  className?: string;
  infoTooltip?: string;
}

export const EditableIncomeCard = ({
  monthlyIncome,
  setMonthlyIncome,
  percentageChange,
  formatCurrency,
  currencyCode,
  className = "",
  infoTooltip,
}: EditableIncomeCardProps) => {
  const [open, setOpen] = useState(false);
  const [income, setIncome] = useState(monthlyIncome.toString());
  const { user } = useAuth();

  const { mutate: updateIncome, isPending } = useMutation({
    mutationFn: async (newIncome: number) => {
      if (!user) return;

      // First try to update the budgets table
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .update({ monthly_income: newIncome })
        .eq('user_id', user.id)
        .limit(1)
        .select();

      // If there's no budget data, update the profiles table instead
      if (!budgetData || budgetData.length === 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ monthly_income: newIncome })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      setMonthlyIncome(parseFloat(income));
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedIncome = parseFloat(income);
    if (!isNaN(parsedIncome) && parsedIncome >= 0) {
      updateIncome(parsedIncome);
    }
  };

  return (
    <>
      <StatCard
        title="Monthly Income"
        value={formatCurrency(monthlyIncome, currencyCode)}
        subtext={<PercentageChange value={percentageChange} />}
        className={className}
        infoTooltip={infoTooltip}
        actionElement={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="w-full text-primary hover:bg-primary/10 flex items-center justify-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Income</span>
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Monthly Income</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                step="0.01"
                min="0"
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Enter your monthly income before taxes and deductions.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
