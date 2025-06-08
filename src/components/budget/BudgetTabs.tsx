
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { CategoryBudgets } from "@/components/budget/CategoryBudgets";
import { BudgetTransactions } from "@/components/budget/BudgetTransactions";
import { BudgetComparison } from "@/components/budget/BudgetComparison";
import { Budget } from "@/pages/Budget";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, Layers, Receipt, BarChart2 } from "lucide-react";

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
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'comparison', label: 'Comparison', icon: BarChart2 },
  ];

  return (
    <motion.div 
      className="w-full space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Tabs 
        value={stableActiveTab} 
        onValueChange={handleValueChange} 
        className="w-full"
      >
        <div className="w-full flex justify-center mb-6">
          <TabsList className="bg-muted/50 backdrop-blur-sm border border-border/40 p-1 rounded-xl grid w-full max-w-md grid-cols-4 gap-1">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all
                          data-[state=active]:bg-background data-[state=active]:text-foreground
                          data-[state=active]:shadow-sm hover:bg-background/50"
              >
                <tab.icon className="w-4 h-4" />
                <span className={isMobile ? "text-[10px]" : "text-xs"}>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="w-full">
          <TabsContent value="overview" className="mt-0 space-y-4">
            <BudgetOverview budgets={budgets} />
          </TabsContent>

          <TabsContent value="categories" className="mt-0 space-y-4">
            <CategoryBudgets budgets={budgets} onEditBudget={onEditBudget} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-0 space-y-4">
            <BudgetTransactions budgets={budgets} />
          </TabsContent>

          <TabsContent value="comparison" className="mt-0 space-y-4">
            <BudgetComparison budgets={budgets} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};
