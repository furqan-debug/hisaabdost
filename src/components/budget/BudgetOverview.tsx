
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Budget } from "@/pages/Budget";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  const filteredBudgets = budgets.filter(budget => budget.category !== "CurrencyPreference" && budget.category !== "income");
  const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  const data = filteredBudgets.map(budget => ({
    name: budget.category,
    value: budget.amount,
    percentage: totalBudget > 0 ? (budget.amount / totalBudget * 100).toFixed(0) : "0"
  }));

  if (filteredBudgets.length === 0) {
    return (
      <Card className="budget-glass-card">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center space-y-3">
            <p className="text-muted-foreground">No budget data available.</p>
            <p className="text-sm text-muted-foreground">Add a budget to see your spending breakdown.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="budget-glass-card">
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl p-4 sm:p-6">
            <div className="w-full h-[250px] sm:h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={isMobile ? 60 : 80}
                    outerRadius={isMobile ? 80 : 110}
                    paddingAngle={3}
                    dataKey="value"
                    cornerRadius={8}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name]} 
                        className="focus:outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg border bg-popover/80 backdrop-blur-sm p-3 shadow-lg"
                        >
                          <p className="text-sm font-medium">{data.name}</p>
                          <p className="text-sm text-popover-foreground">{formatCurrency(data.value, currencyCode)}</p>
                          <p className="text-xs text-muted-foreground">{data.percentage}% of total</p>
                        </motion.div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center total display */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-0 pointer-events-none">
                <p className="text-2xl font-bold">
                  {formatCurrency(totalBudget, currencyCode)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Budget
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6">
              {data.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: CATEGORY_COLORS[entry.name] }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.percentage}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
