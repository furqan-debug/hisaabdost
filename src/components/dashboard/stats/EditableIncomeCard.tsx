
import React, { useState } from "react";
import { StatCard } from "./StatCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { PercentageChange } from "./PercentageChange";
import { logIncomeActivity } from "@/services/activityLogService";

interface EditableIncomeCardProps {
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  percentageChange?: number;
  formatCurrency: (amount: number, currency: string) => string;
  currencyCode: string;
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
  infoTooltip
}: EditableIncomeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(monthlyIncome.toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    const newIncome = parseFloat(inputValue);
    if (isNaN(newIncome) || newIncome < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Updating income to:", newIncome);
      
      // Update in the profiles table first (primary source)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          monthly_income: newIncome
        })
        .eq('id', user?.id);

      if (profileError) {
        console.error('Could not update profiles table:', profileError);
        throw profileError;
      }

      // Also update in budgets table as fallback
      const { error: budgetError } = await supabase
        .from('budgets')
        .upsert({
          user_id: user?.id,
          monthly_income: newIncome,
          category: 'income',
          period: 'monthly',
          amount: 0
        });

      if (budgetError) {
        console.warn('Could not update budgets table:', budgetError);
      }

      // Log the income activity
      try {
        await logIncomeActivity(newIncome, monthlyIncome);
      } catch (logError) {
        console.error('Failed to log income activity:', logError);
      }

      setMonthlyIncome(newIncome);
      setIsOpen(false);
      
      toast({
        title: "Income Updated",
        description: `Monthly income updated to ${formatCurrency(newIncome, currencyCode)}`
      });
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: "Error",
        description: "Failed to update income. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const actionElement = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs hover:bg-muted/50 transition-colors"
          onClick={() => setInputValue(monthlyIncome.toString())}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Monthly Income</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="income">Monthly Income ({currencyCode})</Label>
            <Input
              id="income"
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter your monthly income"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <StatCard
      title="Monthly Income"
      value={formatCurrency(monthlyIncome, currencyCode)}
      subtext={percentageChange !== undefined ? <PercentageChange value={percentageChange} /> : undefined}
      actionElement={actionElement}
      className={className}
      infoTooltip={infoTooltip}
      cardType="income"
    />
  );
};
