
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { BudgetHeader } from "@/components/budget/BudgetHeader";
import { BudgetSummaryCards } from "@/components/budget/BudgetSummaryCards";
import { BudgetTabs } from "@/components/budget/BudgetTabs";
import { useBudgetData } from "@/hooks/useBudgetData";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  carry_forward: boolean;
  created_at: string;
  monthly_income?: number;
}

const Budget = () => {
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { selectedMonth, getCurrentMonthData, updateMonthData } = useMonthContext();
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const currentMonthData = getCurrentMonthData();
  
  // Get active tab from month data with fallback to overview
  const [activeTab, setActiveTab] = useState(currentMonthData.activeTab || 'overview');
  
  console.log('Budget page rendering', { 
    activeTab,
    currentMonthKey, 
    isMobile
  });
  
  const { 
    budgets, 
    isLoading, 
    exportBudgetData,
    totalBudget,
    totalSpent,
    remainingBalance,
    usagePercentage,
    monthlyIncome
  } = useBudgetData();
  
  // Save active tab to month context when it changes
  useEffect(() => {
    updateMonthData(currentMonthKey, {
      activeTab: activeTab
    });
  }, [activeTab, currentMonthKey, updateMonthData]);

  // Save budget data to month context when it changes
  useEffect(() => {
    if (!isLoading) {
      updateMonthData(currentMonthKey, {
        totalBudget,
        remainingBudget: remainingBalance,
        budgetUsagePercentage: usagePercentage,
        monthlyIncome: monthlyIncome
      });
      
      console.log('Budget data updated', {
        totalBudget,
        remainingBudget: remainingBalance,
        budgetUsagePercentage: usagePercentage,
        monthlyIncome
      });
    }
  }, [totalBudget, remainingBalance, usagePercentage, monthlyIncome, currentMonthKey, updateMonthData, isLoading]);

  // Load active tab from month data on initial render
  useEffect(() => {
    const savedTab = currentMonthData.activeTab;
    if (savedTab) {
      setActiveTab(savedTab);
      console.log('Loaded active tab from month context:', savedTab);
    }
  }, [currentMonthData.activeTab]);

  const handleAddBudget = () => {
    setSelectedBudget(null);
    setShowBudgetForm(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetForm(true);
  };

  // Handle tab change
  const handleTabChange = (tabValue: string) => {
    console.log('Tab changed to:', tabValue);
    setActiveTab(tabValue);
    updateMonthData(currentMonthKey, {
      activeTab: tabValue
    });
  };

  if (isLoading) {
    return <div className="p-4 flex justify-center">
      <div className="animate-pulse text-center">
        <p className="text-muted-foreground">Loading your budget data...</p>
      </div>
    </div>;
  }
  
  console.log('Budget data loaded', { 
    budgetsCount: budgets?.length || 0,
    totalBudget,
    remainingBalance
  });

  return (
    <div className="space-y-3 md:space-y-6 pb-20 md:pb-8 budget-container overflow-hidden w-full">
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

      <div className="mx-0 md:mx-0 mobile-container-fix overflow-hidden w-full">
        <BudgetTabs 
          budgets={budgets || []} 
          onEditBudget={handleEditBudget}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      <BudgetForm
        open={showBudgetForm}
        onOpenChange={setShowBudgetForm}
        budget={selectedBudget}
        onSuccess={() => {
          setShowBudgetForm(false);
          setSelectedBudget(null);
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
          toast({
            title: "Success",
            description: `Budget ${selectedBudget ? 'updated' : 'created'} successfully.`,
          });
        }}
        monthlyIncome={monthlyIncome}
        totalBudget={totalBudget}
      />
    </div>
  );
};

export default Budget;
