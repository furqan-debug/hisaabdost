
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Budget } from "@/pages/Budget";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart as PieChartIcon, Target } from "lucide-react";

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
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <PieChartIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-2">No budgets created yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Create your first budget to see insights here
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-2 gap-8"
      >
        {/* Chart Section */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Target className="w-5 h-5 text-blue-600" />
              Budget Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="relative w-full max-w-[350px] h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={3}
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
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
                          <p className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(data.value, currencyCode)}</p>
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
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalBudget, currencyCode)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Total Budget
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Legend Section */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Budget Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[350px] overflow-y-auto">
            {data.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[entry.name] }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{entry.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{entry.percentage}% of budget</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(entry.value, currencyCode)}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
