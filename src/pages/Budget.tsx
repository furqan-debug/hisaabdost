
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { BudgetHeader } from "@/components/budget/BudgetHeader";
import { BudgetSummaryCards } from "@/components/budget/BudgetSummaryCards";
import { BudgetTabs } from "@/components/budget/BudgetTabs";
import { useBudgetData } from "@/hooks/useBudgetData";

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  carry_forward: boolean;
  created_at: string;
}

const Budget = () => {
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const { 
    budgets, 
    isLoading, 
    exportBudgetData,
    totalBudget,
    remainingBalance,
    usagePercentage
  } = useBudgetData();

  const handleAddBudget = () => {
    setSelectedBudget(null);
    setShowBudgetForm(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetForm(true);
  };

  if (isLoading) {
    return <div className="p-4 flex justify-center">
      <div className="animate-pulse text-center">
        <p className="text-muted-foreground">Loading your budget data...</p>
      </div>
    </div>;
  }

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
      />

      <div className="mx-2 md:mx-0 mobile-container-fix overflow-hidden w-full">
        <BudgetTabs 
          budgets={budgets || []} 
          onEditBudget={handleEditBudget}
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
      />
      
      {isMobile && (
        <div className="floating-action-button" onClick={handleAddBudget}>
          <Plus className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};

export default Budget;
