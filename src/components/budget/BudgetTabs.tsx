import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { CategoryBudgets } from "@/components/budget/CategoryBudgets";
import { BudgetTransactions } from "@/components/budget/BudgetTransactions";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { Budget } from "@/pages/Budget";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    <div className="w-full space-y-6">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 w-full py-3">
        <motion.div 
          className="w-full flex justify-center"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs 
            value={stableActiveTab} 
            onValueChange={handleValueChange} 
            className="w-full max-w-2xl mx-auto"
          >
            <TabsList className="bg-muted/30 p-1 rounded-full w-full justify-center gap-1">
              <TabsTrigger 
                value="overview" 
                className="flex-1 rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="flex-1 rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="flex-1 rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="comparison" 
                className="flex-1 rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Comparison
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 px-4">
              <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0">
                <BudgetOverview budgets={budgets || []} />
              </TabsContent>

              <TabsContent value="categories" className="focus-visible:outline-none focus-visible:ring-0">
                <CategoryBudgets budgets={budgets || []} onEditBudget={onEditBudget} />
              </TabsContent>

              <TabsContent value="transactions" className="focus-visible:outline-none focus-visible:ring-0">
                <BudgetTransactions budgets={budgets || []} />
              </TabsContent>

              <TabsContent value="comparison" className="focus-visible:outline-none focus-visible:ring-0">
                <BudgetComparison budgets={budgets || []} />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
