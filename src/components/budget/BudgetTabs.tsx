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
export const BudgetTabs = ({
  budgets,
  onEditBudget,
  activeTab,
  onTabChange
}: BudgetTabsProps) => {
  // Local state to prevent tab flickering
  const [stableActiveTab, setStableActiveTab] = useState(activeTab);

  // Update local tab state when prop changes, but only if it's different
  useEffect(() => {
    if (activeTab !== stableActiveTab) {
      setStableActiveTab(activeTab);
    }
  }, [activeTab]);
  const handleValueChange = (value: string) => {
    setStableActiveTab(value); // Update local state immediately
    onTabChange(value); // Notify parent about the change
  };
  return <Card className="budget-card overflow-hidden px-0 mx-0 my-[11px]">
      <CardContent className="p-0 md:p-6 max-w-full overflow-hidden">
        <Tabs value={stableActiveTab} onValueChange={handleValueChange} className="space-y-4 md:space-y-6 w-full max-w-full overflow-hidden">
          <div className="scrollable-tabs-container w-full overflow-x-auto no-scrollbar">
            <TabsList className="w-full justify-start rounded-none md:rounded-md max-w-full overflow-x-auto mx-px px-[8px] my-0 py-0 bg-white">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="budget-section overflow-hidden w-full">
            <BudgetOverview budgets={budgets || []} />
          </TabsContent>

          <TabsContent value="categories" className="budget-section overflow-hidden w-full">
            <CategoryBudgets budgets={budgets || []} onEditBudget={onEditBudget} />
          </TabsContent>

          <TabsContent value="transactions" className="budget-section overflow-hidden w-full">
            <BudgetTransactions budgets={budgets || []} />
          </TabsContent>

          <TabsContent value="comparison" className="budget-section overflow-hidden w-full">
            <BudgetComparison budgets={budgets || []} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
};