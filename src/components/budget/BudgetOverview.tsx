
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Budget } from "@/pages/Budget";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart as PieChartIcon, DollarSign } from "lucide-react";

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  const filteredBudgets = budgets.filter(budget => budget.category !== "CurrencyPreference");
  const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  const data = filteredBudgets.map(budget => ({
    name: budget.category,
    value: budget.amount,
    percentage: totalBudget > 0 ? (budget.amount / totalBudget * 100).toFixed(1) : "0"
  }));

  if (filteredBudgets.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[600px] flex items-center justify-center"
      >
        <Card className="w-full max-w-md mx-auto text-center border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-8 pt-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mb-6">
              <PieChartIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-12">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">No budgets created yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Create your first budget to see insights here
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-b border-gray-200 dark:border-gray-700 pb-6">
          <CardTitle className="text-3xl font-bold flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <PieChartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Overview
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Chart Section */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[400px] aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 70 : 90}
                      outerRadius={isMobile ? 110 : 140}
                      paddingAngle={5}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl">
                            <p className="font-bold text-gray-900 dark:text-white text-lg">{data.name}</p>
                            <p className="text-blue-600 dark:text-blue-400 font-bold text-xl">{formatCurrency(data.value, currencyCode)}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{data.percentage}% of total</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(totalBudget, currencyCode)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mt-2">
                      Total Budget
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Breakdown</h3>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {data.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-5 rounded-2xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-5 h-5 rounded-full shadow-md" 
                        style={{ backgroundColor: CATEGORY_COLORS[entry.name] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{entry.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.percentage}% of total budget</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-gray-900 dark:text-white">
                          {formatCurrency(entry.value, currencyCode)}
                        </p>
                        <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-2 group-hover:scale-150 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
