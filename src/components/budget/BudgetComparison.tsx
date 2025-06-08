
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { format, parseISO } from "date-fns";
import { TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface BudgetComparisonProps {
  budgets: Budget[];
}

export function BudgetComparison({ budgets }: BudgetComparisonProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  // Group budgets by month using created_at
  const budgetsByMonth = budgets.reduce((acc, budget) => {
    const monthKey = format(parseISO(budget.created_at), 'MMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey };
    }
    acc[monthKey][budget.category] = (acc[monthKey][budget.category] || 0) + budget.amount;
    return acc;
  }, {} as Record<string, any>);

  // Convert to array and sort chronologically
  const data = Object.values(budgetsByMonth).sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });

  if (budgets.length === 0 || Object.keys(budgetsByMonth).length <= 1) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[600px] flex items-center justify-center"
      >
        <Card className="w-full max-w-md mx-auto text-center border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-8 pt-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-3xl flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Monthly Budget Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-12">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">Not enough data for comparison</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {budgets.length === 0 
                ? "Add your first budget to see monthly comparisons" 
                : "Add budgets across different months to see comparisons"}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const activeCategories = Object.keys(CATEGORY_COLORS).filter(category => 
    data.some(item => item[category] > 0)
  );

  const getCategoryTotal = (category: string) => 
    data.reduce((sum, item) => sum + (item[category] || 0), 0);

  const topCategories = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a))
    .slice(0, isMobile ? 4 : 6);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-950/50 dark:to-cyan-950/50 border-b border-gray-200 dark:border-gray-700 pb-6">
          <CardTitle className="text-3xl font-bold flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Monthly Budget Comparison
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center">
              {topCategories.map((category, index) => (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div 
                    className="w-4 h-4 rounded-full shadow-md" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{category}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {formatCurrency(getCategoryTotal(category), currencyCode)}
                  </span>
                </motion.div>
              ))}
            </div>
            
            {/* Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div className="w-full h-[400px] sm:h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 30,
                      right: isMobile ? 20 : 40,
                      left: isMobile ? 20 : 30,
                      bottom: isMobile ? 60 : 80
                    }}
                    barCategoryGap={isMobile ? "20%" : "30%"}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(156, 163, 175, 0.3)" 
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: isMobile ? 12 : 14,
                        fill: "rgb(107, 114, 128)",
                        fontWeight: 600,
                      }}
                      height={80}
                      interval={0}
                      angle={isMobile ? -45 : -30}
                      textAnchor="end"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: isMobile ? 11 : 13,
                        fill: "rgb(107, 114, 128)",
                        fontWeight: 600,
                      }}
                      tickFormatter={(value) => `${Math.round(value)}`}
                      width={isMobile ? 60 : 80}
                    />
                    <Tooltip
                      cursor={{ 
                        fill: "rgba(59, 130, 246, 0.1)",
                        radius: 8 
                      }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const filteredPayload = payload.filter(
                          entry => Number(entry.value) > 0
                        );
                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-2xl">
                            <div className="font-bold text-xl mb-4 text-gray-900 dark:text-white">{label}</div>
                            <div className="space-y-3">
                              {filteredPayload.map((entry, idx) => (
                                <div className="flex items-center justify-between gap-6" key={entry.name}>
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-4 h-4 rounded-full shadow-md" 
                                      style={{backgroundColor: entry.color}} 
                                    />
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.name}</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(Number(entry.value), currencyCode)}
                                  </span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between">
                                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total:</span>
                                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(
                                      filteredPayload.reduce((sum, entry) => sum + Number(entry.value), 0),
                                      currencyCode
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    {topCategories.map(category => (
                      <Bar
                        key={category}
                        dataKey={category}
                        fill={CATEGORY_COLORS[category]}
                        radius={[6, 6, 0, 0]} 
                        maxBarSize={isMobile ? 35 : 50}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
