
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
      className="w-full max-w-full overflow-hidden space-y-8" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <Tabs value={stableActiveTab} onValueChange={handleValueChange} className="w-full max-w-full">
        <div className="w-full flex justify-center mb-10">
          <div className="relative">
            <TabsList className="inline-flex bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-xl border border-border/40 p-2 rounded-3xl shadow-xl ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex gap-2">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TabsTrigger 
                      value={tab.id} 
                      className="group relative inline-flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 hover:bg-accent/60 hover:text-accent-foreground whitespace-nowrap min-w-[130px] justify-center border border-transparent data-[state=active]:border-primary/20"
                    >
                      <tab.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-data-[state=active]:scale-110" />
                      <span className="font-semibold tracking-wide">
                        {tab.label}
                      </span>
                      {/* Active indicator */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-data-[state=active]:opacity-100"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    </TabsTrigger>
                  </motion.div>
                ))}
              </div>
            </TabsList>
            
            {/* Decorative gradient background */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 blur-xl" />
          </div>
        </div>

        <div className="w-full max-w-full overflow-hidden">
          <TabsContent value="overview" className="mt-0 w-full max-w-full overflow-hidden focus-visible:outline-none">
            <motion.div 
              className="w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key="overview"
            >
              <BudgetOverview budgets={budgets} />
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="mt-0 w-full max-w-full overflow-hidden focus-visible:outline-none">
            <motion.div 
              className="w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key="categories"
            >
              <CategoryBudgets budgets={budgets} onEditBudget={onEditBudget} />
            </motion.div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0 w-full max-w-full overflow-hidden focus-visible:outline-none">
            <motion.div 
              className="w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key="transactions"
            >
              <BudgetTransactions budgets={budgets} />
            </motion.div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-0 w-full max-w-full overflow-hidden focus-visible:outline-none">
            <motion.div 
              className="w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key="comparison"
            >
              <BudgetComparison budgets={budgets} />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};
