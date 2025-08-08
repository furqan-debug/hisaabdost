
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

  console.log("Budget component rendering");

  const budgetData = useBudgetData();
  console.log("Budget data received:", budgetData);

  const {
    budgets = [],
    expenses = [],
    isLoading = false,
    exportBudgetData,
    totalBudget = 0,
    totalSpent = 0,
    remainingBalance = 0,
    usagePercentage = 0,
    monthlyIncome = 0,
    budgetNotificationData = [],
  } = budgetData || {};

  // Setup notification triggers for budget page
  useNotificationTriggers({
    budgets: budgetNotificationData,
    monthlyExpenses: totalSpent,
    monthlyIncome,
    walletBalance: remainingBalance,
  });

  const handleAddBudget = () => {
    console.log("Add budget clicked");
    setEditingBudget(null);
    setShowBudgetForm(true);
  };

  const handleEditBudget = (budget: Budget) => {
    console.log("Edit budget clicked:", budget);
    setEditingBudget(budget);
    setShowBudgetForm(true);
  };

  const handleBudgetFormClose = () => {
    console.log("Budget form close");
    setShowBudgetForm(false);
    setEditingBudget(null);
  };

  const handleBudgetSuccess = () => {
    console.log("Budget success");
    handleBudgetFormClose();
    // Trigger a refresh of budget data
    window.dispatchEvent(new Event('budget-updated'));
  };

  console.log("Rendering with isLoading:", isLoading, "budgets:", budgets?.length);

  // Show error state if there's a critical issue
  if (!budgetData) {
    console.error("No budget data available");
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load budget data</h2>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    console.log("Showing loading state");
    return (
      <div className="min-h-screen bg-background p-4 space-y-6">
        <div className="h-24 bg-muted/20 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted/20 rounded-lg animate-pulse" />
      </div>
    );
  }

  console.log("Rendering main budget content");

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto max-w-7xl px-2 sm:px-4 pt-6 space-y-8 pb-24 md:pb-8">
        <BudgetHeader 
          onAddBudget={handleAddBudget}
          onExport={exportBudgetData || (() => {})} 
        />
        
        <BudgetSummaryCards 
          totalBudget={totalBudget}
          remainingBalance={remainingBalance}
          usagePercentage={usagePercentage}
          monthlyIncome={monthlyIncome}
          isLoading={isLoading}
        />
        
        <BudgetTabs 
          budgets={budgets}
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
        />
      </div>
    </div>
  );
};

export default Budget;
