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

  return (
    <Card className="budget-card overflow-hidden mx-0 px-0 min-h-[500px]">
      <CardContent className="p-0 md:p-6 max-w-full h-full">
        <Tabs 
          value={stableActiveTab} 
          onValueChange={handleValueChange} 
          className="space-y-4 md:space-y-6 w-full h-full flex flex-col"
        >
          <div className="scrollable-tabs-container w-full overflow-x-auto no-scrollbar flex-shrink-0">
            <TabsList className="w-full justify-start px-0 mx-0 rounded-none md:rounded-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="overview" className="h-full">
              <BudgetOverview budgets={budgets || []} />
            </TabsContent>

            <TabsContent value="categories" className="h-full">
              <CategoryBudgets budgets={budgets || []} onEditBudget={onEditBudget} />
            </TabsContent>

            <TabsContent value="transactions" className="h-full">
              <BudgetTransactions budgets={budgets || []} />
            </TabsContent>

            <TabsContent value="comparison" className="h-full">
              <BudgetComparison budgets={budgets || []} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
