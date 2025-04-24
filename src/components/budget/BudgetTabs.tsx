import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { CategoryBudgets } from "@/components/budget/CategoryBudgets";
import { BudgetTransactions } from "@/components/budget/BudgetTransactions";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { Budget } from "@/pages/Budget";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, Category, Receipt, BarChart2 } from "lucide-react";

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
  onTabChange,
}: BudgetTabsProps) => {
  const isMobile = useIsMobile();
  const [stableActiveTab, setStableActiveTab] = useState(activeTab);

  useEffect(() => {
    if (activeTab !== stableActiveTab) {
      setStableActiveTab(activeTab);
    }
  }, [activeTab, stableActiveTab]);

  const handleValueChange = (value: string) => {
    setStableActiveTab(value);
    onTabChange(value);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'categories', label: 'Categories', icon: Category },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'comparison', label: 'Comparison', icon: BarChart2 },
  ];

  return (
    <div className="w-full space-y-4 mt-4">
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
          <TabsList className="bg-background border border-border/40 p-1 rounded-full w-full justify-center gap-1.5 relative">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all
                          data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                          data-[state=active]:shadow-sm hover:bg-muted/50"
              >
                <tab.icon className="w-4 h-4" />
                <span className={isMobile ? "hidden sm:inline" : "inline"}>
                  {tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4 px-2 tab-content-mobile">
            <TabsContent value="overview" className="mt-0">
              <BudgetOverview budgets={budgets} />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <CategoryBudgets budgets={budgets} onEditBudget={onEditBudget} />
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <BudgetTransactions budgets={budgets} />
            </TabsContent>

            <TabsContent value="comparison" className="mt-0">
              <BudgetComparison budgets={budgets} />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
};
