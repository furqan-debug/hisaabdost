
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
  onTabChange
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

  const tabs = [{
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard
  }, {
    id: 'categories',
    label: 'Categories',
    icon: Layers
  }, {
    id: 'transactions',
    label: 'Transactions',
    icon: Receipt
  }, {
    id: 'comparison',
    label: 'Comparison',
    icon: BarChart2
  }];

  return (
    <motion.div 
      className="w-full max-w-full overflow-hidden space-y-6" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <Tabs value={stableActiveTab} onValueChange={handleValueChange} className="w-full max-w-full">
        <div className="w-full flex justify-center mb-8">
          <TabsList className="inline-flex bg-background/60 backdrop-blur-md border border-border/30 p-1.5 rounded-2xl shadow-lg overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="inline-flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50 whitespace-nowrap min-w-[120px] justify-center"
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">
                    {tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </div>
          </TabsList>
        </div>

        <div className="w-full max-w-full overflow-hidden">
          <TabsContent value="overview" className="mt-0 w-full max-w-full overflow-hidden">
            <motion.div 
              className="w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BudgetOverview budgets={budgets} />
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="mt-0 w-full max-w-full overflow-hidden">
            <motion.div 
              className="w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryBudgets budgets={budgets} onEditBudget={onEditBudget} />
            </motion.div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0 w-full max-w-full overflow-hidden">
            <motion.div 
              className="w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BudgetTransactions budgets={budgets} />
            </motion.div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-0 w-full max-w-full overflow-hidden">
            <motion.div 
              className="w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BudgetComparison budgets={budgets} />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};
