
import React from "react";
import { StatCard } from "./StatCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { PercentageChange } from "./PercentageChange";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CurrencyCode } from "@/utils/currencyUtils";
import { Edit2 } from "lucide-react";

interface EditableIncomeCardProps {
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  percentageChange: number;
  formatCurrency: (value: number, currencyCode: CurrencyCode) => string;
  currencyCode: CurrencyCode;
}

export const EditableIncomeCard = ({
  monthlyIncome,
  setMonthlyIncome,
  percentageChange,
  formatCurrency,
  currencyCode,
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

  const changeDisplay = percentageChange !== 0 ? (
    <PercentageChange value={percentageChange} />
  ) : (
    <div className="text-xs text-muted-foreground">No change from last month</div>
  );

  return (
    <>
      <StatCard
        title="Monthly Income"
        value={formatCurrency(monthlyIncome, currencyCode)}
        subtext={changeDisplay}
        actionElement={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            className="text-primary hover:bg-primary/10 px-2 py-1 h-auto flex items-center text-xs font-medium"
          >
            <Edit2 className="w-3 h-3 mr-1" /> Edit Income
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
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
