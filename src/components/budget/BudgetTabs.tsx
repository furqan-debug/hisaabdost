
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
  const [stableActiveTab, setStableActiveTab] = useState(activeTab);

  useEffect(() => {
    if (activeTab !== stableActiveTab) {
      setStableActiveTab(activeTab);
    }
  }, [activeTab]);

  const handleValueChange = (value: string) => {
    setStableActiveTab(value);
    onTabChange(value);
  };

  return (
    <Card className="budget-card mx-0 px-0 w-full h-full min-h-[500px] flex flex-col overflow-hidden">
      <CardContent className="p-0 md:p-6 w-full h-full flex flex-col flex-1">
        <Tabs 
          value={stableActiveTab} 
          onValueChange={handleValueChange} 
          className="w-full h-full flex flex-col flex-1"
        >
          <div className="scrollable-tabs-container w-full overflow-x-auto no-scrollbar flex-shrink-0">
            <TabsList className="w-full justify-start px-0 mx-0 rounded-none md:rounded-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden p-4 min-h-[500px]">
            <TabsContent 
              value="overview" 
              className="h-full data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden min-h-[500px]"
            >
              <BudgetOverview budgets={budgets || []} />
            </TabsContent>

            <TabsContent 
              value="categories" 
              className="h-full data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden min-h-[500px]"
            >
              <CategoryBudgets budgets={budgets || []} onEditBudget={onEditBudget} />
            </TabsContent>

            <TabsContent 
              value="transactions" 
              className="h-full data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden min-h-[500px]"
            >
              <BudgetTransactions budgets={budgets || []} />
            </TabsContent>

            <TabsContent 
              value="comparison" 
              className="h-full data-[state=active]:flex data-[state=active]:flex-col data-[state=inactive]:hidden min-h-[500px]"
            >
              <BudgetComparison budgets={budgets || []} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
