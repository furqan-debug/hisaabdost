
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

  const handleTabChange = (tabValue: string) => {
    updateMonthData(currentMonthKey, {
      activeTab: tabValue
    });
  };

  const activeTab = currentMonthData.activeTab || 'overview';

  if (isLoading) {
    return <div className="p-4 flex justify-center min-h-[500px]">
      <div className="animate-pulse text-center">
        <p className="text-muted-foreground">Loading your budget data...</p>
      </div>
    </div>;
  }

  return (
    <div className="space-y-3 md:space-y-6 pb-20 md:pb-8 budget-container h-full flex flex-col min-h-[calc(100vh-200px)]">
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

      <div className="mx-2 md:mx-0 mobile-container-fix overflow-hidden flex-1 min-h-0">
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
