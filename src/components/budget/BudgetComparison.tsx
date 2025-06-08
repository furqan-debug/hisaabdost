
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
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Monthly Budget Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Not enough data for comparison</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {budgets.length === 0 
                ? "Add your first budget to see monthly comparisons" 
                : "Add budgets across different months to see comparisons"}
            </p>
          </CardContent>
        </Card>
      </div>
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
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Monthly Budget Comparison
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center">
              {topCategories.map((category, index) => (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{category}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {formatCurrency(getCategoryTotal(category), currencyCode)}
                  </span>
                </motion.div>
              ))}
            </div>
            
            {/* Chart */}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60
                    }}
                    barCategoryGap="25%"
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
                        fontSize: 12,
                        fill: "rgb(107, 114, 128)",
                        fontWeight: 500,
                      }}
                      height={60}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "rgb(107, 114, 128)",
                        fontWeight: 500,
                      }}
                      tickFormatter={(value) => `${Math.round(value)}`}
                    />
                    <Tooltip
                      cursor={{ 
                        fill: "rgba(59, 130, 246, 0.1)",
                        radius: 4 
                      }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const filteredPayload = payload.filter(
                          entry => Number(entry.value) > 0
                        );
                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
                            <div className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">{label}</div>
                            <div className="space-y-2">
                              {filteredPayload.map((entry, idx) => (
                                <div className="flex items-center justify-between gap-4" key={entry.name}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{backgroundColor: entry.color}} 
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.name}</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(Number(entry.value), currencyCode)}
                                  </span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total:</span>
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
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={40}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
