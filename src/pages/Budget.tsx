
import React, { useState } from "react";
import { useBudgetData } from "@/hooks/useBudgetData";
import { BudgetHeader } from "@/components/budget/BudgetHeader";
import { BudgetSummaryCards } from "@/components/budget/BudgetSummaryCards";
import { BudgetTabs } from "@/components/budget/BudgetTabs";
import { BudgetForm } from "@/components/budget/BudgetForm";
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
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

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

  const handleAddBudget = () => {
    setEditingBudget(null);
    setShowBudgetForm(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setShowBudgetForm(true);
  };

  const handleBudgetFormClose = () => {
    setShowBudgetForm(false);
    setEditingBudget(null);
  };

  const handleBudgetSuccess = () => {
    handleBudgetFormClose();
    // Trigger a refresh of budget data
    window.dispatchEvent(new Event('budget-updated'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-6">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        <BudgetHeader 
          onAddBudget={handleAddBudget}
          onExport={exportBudgetData} 
        />
        
        <BudgetSummaryCards 
          totalBudget={totalBudget}
          remainingBalance={remainingBalance}
          usagePercentage={usagePercentage}
          monthlyIncome={monthlyIncome}
          isLoading={isLoading}
        />
        
        <BudgetTabs 
          budgets={budgets || []}
          onEditBudget={handleEditBudget}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <BudgetForm
          open={showBudgetForm}
          onOpenChange={setShowBudgetForm}
          budget={editingBudget}
          onSuccess={handleBudgetSuccess}
          monthlyIncome={monthlyIncome}
          totalBudget={totalBudget}
        />
      </div>
    </div>
  );
};

export default Budget;
