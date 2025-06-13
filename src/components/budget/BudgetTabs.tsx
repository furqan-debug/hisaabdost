
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
      className="w-full space-y-8" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <Tabs value={stableActiveTab} onValueChange={handleValueChange} className="w-full">
        <div className="w-full mb-8">
          <TabsList className={`
            w-full h-auto p-2 bg-muted/30 rounded-xl
            ${isMobile 
              ? 'grid grid-cols-2 gap-2' 
              : 'inline-flex gap-1 justify-center'
            }
          `}>
            {tabs.map((tab, index) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={isMobile ? "w-full" : ""}
              >
                <TabsTrigger 
                  value={tab.id} 
                  className={`
                    relative inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                    data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm
                    hover:bg-background/50 hover:text-foreground
                    ${isMobile 
                      ? 'w-full justify-center min-h-[60px] flex-col gap-1' 
                      : 'whitespace-nowrap min-w-[120px] justify-center'
                    }
                  `}
                >
                  <tab.icon className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
                  <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {tab.label}
                  </span>
                </TabsTrigger>
              </motion.div>
            ))}
          </TabsList>
        </div>

        <div className="w-full">
          <TabsContent value="overview" className="mt-0 w-full focus-visible:outline-none">
            <motion.div 
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key="overview"
            >
              <BudgetOverview budgets={budgets} />
            </motion.div>
          </TabsContent>

          <TabsContent value="categories" className="mt-0 w-full focus-visible:outline-none">
            <motion.div 
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key="categories"
            >
              <CategoryBudgets budgets={budgets} onEditBudget={onEditBudget} />
            </motion.div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0 w-full focus-visible:outline-none">
            <motion.div 
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key="transactions"
            >
              <BudgetTransactions budgets={budgets} />
            </motion.div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-0 w-full focus-visible:outline-none">
            <motion.div 
              className="w-full"
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
