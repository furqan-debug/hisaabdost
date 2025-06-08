
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
      <div className="w-full max-w-full overflow-hidden">
        <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <div className="w-8 h-8 rounded-full bg-muted"></div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">No budget categories found</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Add your first budget to see an overview here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <motion.div 
            className="w-full space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl bg-background/50 p-4 sm:p-6 border border-border/30">
              <div className="w-full h-[280px] sm:h-[320px] relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                  <p className="text-xl sm:text-2xl font-semibold text-foreground">
                    {formatCurrency(totalBudget, currencyCode)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Budget
                  </p>
                </div>
                
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={data} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={isMobile ? 55 : 75}
                      outerRadius={isMobile ? 80 : 105}
                      paddingAngle={2}
                      dataKey="value"
                      cornerRadius={4}
                      strokeWidth={1}
                      stroke="hsl(var(--background))"
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
                            className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg"
                          >
                            <p className="text-sm font-medium text-foreground">{data.name}</p>
                            <p className="text-sm text-foreground">{formatCurrency(data.value, currencyCode)}</p>
                            <p className="text-xs text-muted-foreground">{data.percentage}% of total</p>
                          </motion.div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                {data.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card/60 border border-border/30"
                  >
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: CATEGORY_COLORS[entry.name] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">{entry.percentage}%</p>
                        <p className="text-xs font-medium text-foreground">
                          {formatCurrency(entry.value, currencyCode)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
