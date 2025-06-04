
import React from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { BudgetHeader } from "@/components/budget/BudgetHeader";
import { BudgetSummaryCards } from "@/components/budget/BudgetSummaryCards";
import { BudgetTabs } from "@/components/budget/BudgetTabs";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  carry_forward: boolean;
  created_at: string;
  user_id: string;
}

const Budget = () => {
  const {
    budgets,
    expenses,
    isLoading,
    exportBudgetData,
    totalBudget,
    totalSpent,
    remainingBalance,
    usagePercentage,
    monthlyIncome,
    budgetNotificationData,
  } = useBudgetData();

  // Setup notification triggers for budget page
  useNotificationTriggers({
    budgets: budgetNotificationData,
    monthlyExpenses: totalSpent,
    monthlyIncome,
    walletBalance: remainingBalance,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted/20 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted/20 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BudgetHeader onExport={exportBudgetData} />
      
      <BudgetSummaryCards 
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        remainingBalance={remainingBalance}
        usagePercentage={usagePercentage}
        monthlyIncome={monthlyIncome}
      />
      
      <BudgetTabs 
        budgets={budgets || []}
        expenses={expenses || []}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Budget;
