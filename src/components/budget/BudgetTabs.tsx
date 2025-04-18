
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { CategoryBudgets } from "@/components/budget/CategoryBudgets";
import { BudgetTransactions } from "@/components/budget/BudgetTransactions";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { Budget } from "@/pages/Budget";
import { useEffect, useState } from "react";

interface BudgetTabsProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const BudgetTabs = ({ budgets, onEditBudget, activeTab, onTabChange }: BudgetTabsProps) => {
  // Use a safe default value for activeTab
  const safeActiveTab = activeTab || 'overview';
  // Local state to prevent tab flickering
  const [stableActiveTab, setStableActiveTab] = useState(safeActiveTab);
  
  // Update local tab state when prop changes, but only if it's different
  useEffect(() => {
    if (safeActiveTab !== stableActiveTab) {
      setStableActiveTab(safeActiveTab);
    }
  }, [safeActiveTab, stableActiveTab]);
  
  const handleValueChange = (value: string) => {
    setStableActiveTab(value); // Update local state immediately
    onTabChange(value); // Notify parent about the change
  };

  // Safe budgets array to prevent undefined errors
  const safeBudgets = Array.isArray(budgets) ? budgets : [];

  return (
    <Card className="budget-card overflow-hidden">
      <CardContent className="p-0 md:p-6 max-w-full overflow-hidden">
        <Tabs 
          value={stableActiveTab} 
          onValueChange={handleValueChange} 
          className="space-y-4 md:space-y-6 w-full max-w-full overflow-hidden"
        >
          <div className="scrollable-tabs-container w-full overflow-x-auto no-scrollbar">
            <TabsList className="w-full justify-start px-0 mx-0 rounded-none md:rounded-md max-w-full overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="budget-section overflow-hidden w-full">
            <BudgetOverview budgets={safeBudgets} />
          </TabsContent>

          <TabsContent value="categories" className="budget-section overflow-hidden w-full">
            <CategoryBudgets 
              budgets={safeBudgets}
              onEditBudget={onEditBudget}
            />
          </TabsContent>

          <TabsContent value="transactions" className="budget-section overflow-hidden w-full">
            <BudgetTransactions budgets={safeBudgets} />
          </TabsContent>

          <TabsContent value="comparison" className="budget-section overflow-hidden w-full">
            <BudgetComparison budgets={safeBudgets} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
