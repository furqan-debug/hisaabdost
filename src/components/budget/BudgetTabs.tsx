
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { CategoryBudgets } from "@/components/budget/CategoryBudgets";
import { BudgetTransactions } from "@/components/budget/BudgetTransactions";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { Budget } from "@/pages/Budget";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
    <Card className="budget-card overflow-visible">
      <CardContent className="p-0 md:p-6 overflow-visible">
        <Tabs value={stableActiveTab} onValueChange={handleValueChange} className="space-y-4 md:space-y-6 w-full overflow-visible">
          <div className="scrollable-tabs-container">
            <TabsList className="tabs-list-scroll w-full justify-start rounded-none md:rounded-md py-[11px] px-4 md:px-[39px]">
              <TabsTrigger value="overview" className="budget-tabs-trigger">Overview</TabsTrigger>
              <TabsTrigger value="categories" className="budget-tabs-trigger">Categories</TabsTrigger>
              <TabsTrigger value="transactions" className="budget-tabs-trigger">Transactions</TabsTrigger>
              <TabsTrigger value="comparison" className="budget-tabs-trigger">Comparison</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="budget-section w-full">
            <div className="budget-content">
              <BudgetOverview budgets={budgets || []} />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="budget-section w-full">
            <div className="budget-content">
              <CategoryBudgets budgets={budgets || []} onEditBudget={onEditBudget} />
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="budget-section w-full">
            <div className="budget-content">
              <BudgetTransactions budgets={budgets || []} />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="budget-section w-full">
            <div className="budget-content">
              <BudgetComparison budgets={budgets || []} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
