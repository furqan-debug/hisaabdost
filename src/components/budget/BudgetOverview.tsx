
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

  const filteredBudgets = budgets.filter(budget => budget.category !== "CurrencyPreference");
  const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const data = filteredBudgets.map(budget => ({
    name: budget.category,
    value: budget.amount,
    percentage: totalBudget > 0 ? (budget.amount / totalBudget * 100).toFixed(0) : "0"
  }));

  if (filteredBudgets.length === 0) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-border/40">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center space-y-3">
            <p className="text-muted-foreground">No budget categories found</p>
            <p className="text-sm text-muted-foreground">Add your first budget to see an overview here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/40">
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="h-full space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl bg-background/50 p-6">
            <div className="w-full h-[300px] relative pie-chart-container">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <p className="text-2xl font-semibold">
                  {formatCurrency(totalBudget, currencyCode)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Budget
                </p>
              </div>
              
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={data} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={isMobile ? 60 : 80}
                    outerRadius={isMobile ? 85 : 110}
                    paddingAngle={3}
                    dataKey="value"
                    cornerRadius={6}
                    strokeWidth={2}
                    stroke="white"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name]} 
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
                          className="rounded-lg border bg-card/95 backdrop-blur-sm p-3 shadow-sm"
                        >
                          <p className="text-sm font-medium">{data.name}</p>
                          <p className="text-sm">{formatCurrency(data.value, currencyCode)}</p>
                          <p className="text-xs text-muted-foreground">{data.percentage}% of total</p>
                        </motion.div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
              {data.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-card/50"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
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
