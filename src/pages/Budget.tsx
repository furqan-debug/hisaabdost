
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
import { useCurrency } from "@/hooks/use-currency";

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
  const { currencyCode } = useCurrency();
  const { selectedMonth, getCurrentMonthData, updateMonthData } = useMonthContext();
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const currentMonthData = getCurrentMonthData();
  
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

  // Save budget data to month context when it changes
  useEffect(() => {
    if (!isLoading) {
      updateMonthData(currentMonthKey, {
        totalBudget,
        remainingBudget: remainingBalance,
        budgetUsagePercentage: usagePercentage,
        monthlyIncome: monthlyIncome
      });
    }
  }, [totalBudget, remainingBalance, usagePercentage, monthlyIncome, currentMonthKey, updateMonthData, isLoading]);

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
    console.log("Tab changed to:", tabValue);
    updateMonthData(currentMonthKey, {
      activeTab: tabValue
    });
  };

  // Get active tab from month data
  const activeTab = currentMonthData.activeTab || 'overview';
  console.log("Current active tab:", activeTab);

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center min-h-[200px]">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading your budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-guard space-y-3 pb-20 md:pb-8 min-h-[100dvh] w-full overflow-x-hidden budget-container">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-3 py-2">
        <BudgetHeader 
          onAddBudget={handleAddBudget}
          onExport={exportBudgetData}
        />
      </div>

      <div className="px-3">
        <BudgetSummaryCards
          totalBudget={totalBudget}
          remainingBalance={remainingBalance}
          usagePercentage={usagePercentage}
          monthlyIncome={monthlyIncome}
          isLoading={isLoading}
        />
      </div>

      <div className="w-full min-h-[350px] budget-content">
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
