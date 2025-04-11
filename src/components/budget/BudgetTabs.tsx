
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

export const BudgetTabs = ({ budgets, onEditBudget, activeTab, onTabChange }: BudgetTabsProps) => {
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
    <Card className="budget-card overflow-hidden">
      <CardContent className="p-0 md:p-6 max-w-full overflow-hidden">
        <Tabs 
          value={stableActiveTab} 
          onValueChange={handleValueChange} 
          className="space-y-4 md:space-y-6 w-full max-w-full overflow-hidden"
        >
          <div className="scrollable-tabs-container w-full overflow-x-auto no-scrollbar">
            <TabsList className={`w-full ${isMobile ? 'justify-start' : 'justify-center'} px-0 mx-0 rounded-none md:rounded-md max-w-full overflow-x-auto`}>
              <TabsTrigger 
                value="overview" 
                className="budget-tabs-trigger flex-shrink-0 whitespace-nowrap"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="budget-tabs-trigger flex-shrink-0 whitespace-nowrap"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="budget-tabs-trigger flex-shrink-0 whitespace-nowrap"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="comparison" 
                className="budget-tabs-trigger flex-shrink-0 whitespace-nowrap"
              >
                Comparison
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="budget-section overflow-hidden w-full">
            <BudgetOverview budgets={budgets || []} />
          </TabsContent>

          <TabsContent value="categories" className="budget-section overflow-hidden w-full">
            <CategoryBudgets 
              budgets={budgets || []}
              onEditBudget={onEditBudget}
            />
          </TabsContent>

          <TabsContent value="transactions" className="budget-section overflow-hidden w-full">
            <BudgetTransactions budgets={budgets || []} />
          </TabsContent>

          <TabsContent value="comparison" className="budget-section overflow-hidden w-full">
            <BudgetComparison budgets={budgets || []} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
