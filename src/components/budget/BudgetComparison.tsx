
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
        className="w-full"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Monthly Budget Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-lg font-medium text-muted-foreground mb-2">Not enough data for comparison</p>
            <p className="text-sm text-muted-foreground/80">
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
      className="w-full"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/20">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/30 to-primary/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            Monthly Budget Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center">
              {topCategories.map((category, index) => (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-background/80 to-background/60 px-4 py-2 rounded-full border border-border/30 shadow-sm"
                >
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                  <span className="text-sm font-medium text-foreground">{category}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-background/50 to-background/30 p-6 rounded-xl border border-border/30"
            >
              <div className="w-full h-[350px] sm:h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: isMobile ? 10 : 30,
                      left: isMobile ? 10 : 20,
                      bottom: isMobile ? 50 : 70
                    }}
                    barCategoryGap={isMobile ? "15%" : "25%"}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      opacity={0.3}
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: isMobile ? 11 : 13,
                        fill: "hsl(var(--muted-foreground))",
                        fontWeight: 500,
                      }}
                      height={60}
                      interval={0}
                      angle={isMobile ? -45 : -30}
                      textAnchor="end"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: isMobile ? 10 : 12,
                        fill: "hsl(var(--muted-foreground))",
                        fontWeight: 500,
                      }}
                      tickFormatter={(value) => `${Math.round(value)}`}
                      width={isMobile ? 50 : 70}
                    />
                    <Tooltip
                      cursor={{ 
                        fill: "hsl(var(--muted))", 
                        opacity: 0.1,
                        radius: 4 
                      }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const filteredPayload = payload.filter(
                          entry => Number(entry.value) > 0
                        );
                        return (
                          <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-xl">
                            <div className="font-bold text-lg mb-3 text-foreground">{label}</div>
                            <div className="space-y-2">
                              {filteredPayload.map((entry, idx) => (
                                <div className="flex items-center justify-between gap-4" key={entry.name}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{backgroundColor: entry.color}} 
                                    />
                                    <span className="text-sm font-medium text-foreground">{entry.name}</span>
                                  </div>
                                  <span className="text-sm font-bold text-foreground">
                                    {formatCurrency(Number(entry.value), currencyCode)}
                                  </span>
                                </div>
                              ))}
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
                        radius={[3, 3, 0, 0]} 
                        maxBarSize={isMobile ? 30 : 40}
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
