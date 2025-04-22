
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
  }, [activeTab, stableActiveTab]);

  const handleValueChange = (value: string) => {
    setStableActiveTab(value); // Update local state immediately
    onTabChange(value); // Notify parent about the change
  };

  return (
    <Card className="min-h-[600px] h-full w-full overflow-hidden shadow-md border-border/30 backdrop-blur-sm">
      <CardContent className="p-0 h-full">
        <Tabs 
          value={stableActiveTab} 
          onValueChange={handleValueChange} 
          className="flex flex-col h-full"
        >
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 w-full border-b border-border/20">
            <TabsList className="w-full justify-start rounded-none md:rounded-md scrollable-tabs-container">
              <TabsTrigger value="overview" className="budget-tabs-trigger">Overview</TabsTrigger>
              <TabsTrigger value="categories" className="budget-tabs-trigger">Categories</TabsTrigger>
              <TabsTrigger value="transactions" className="budget-tabs-trigger">Transactions</TabsTrigger>
              <TabsTrigger value="comparison" className="budget-tabs-trigger">Comparison</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 h-[calc(100%-48px)] min-h-[500px] overflow-y-auto">
            <TabsContent value="overview" className="h-full mt-0 p-4 tab-content-mobile">
              <BudgetOverview budgets={budgets || []} />
            </TabsContent>

            <TabsContent value="categories" className="h-full mt-0 p-4 tab-content-mobile">
              <CategoryBudgets budgets={budgets || []} onEditBudget={onEditBudget} />
            </TabsContent>

            <TabsContent value="transactions" className="h-full mt-0 p-4 tab-content-mobile">
              <BudgetTransactions budgets={budgets || []} />
            </TabsContent>

            <TabsContent value="comparison" className="h-full mt-0 p-4 tab-content-mobile">
              <BudgetComparison budgets={budgets || []} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
