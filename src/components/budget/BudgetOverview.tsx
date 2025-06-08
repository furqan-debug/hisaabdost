
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Budget } from "@/pages/Budget";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

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
        className="w-full"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <PieChartIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-lg font-medium text-muted-foreground mb-2">No budgets created yet</p>
            <p className="text-sm text-muted-foreground/80">
              Create your first budget to see a beautiful overview here
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
      className="w-full"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/20">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/30 to-primary/20 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-5 h-5 text-primary" />
            </div>
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chart Section */}
            <div className="relative">
              <div className="aspect-square max-w-[350px] mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-full"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={data} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={isMobile ? 60 : 80}
                      outerRadius={isMobile ? 90 : 120}
                      paddingAngle={3}
                      dataKey="value"
                      cornerRadius={6}
                      strokeWidth={0}
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
                          <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-xl">
                            <p className="font-semibold text-foreground">{data.name}</p>
                            <p className="text-primary font-bold">{formatCurrency(data.value, currencyCode)}</p>
                            <p className="text-xs text-muted-foreground">{data.percentage}% of total</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {formatCurrency(totalBudget, currencyCode)}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      Total Budget
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Budget Breakdown</h3>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {data.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-background/80 to-background/60 border border-border/30 hover:border-border/60 hover:shadow-md transition-all duration-200"
                  >
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ backgroundColor: CATEGORY_COLORS[entry.name] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.percentage}% of total</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatCurrency(entry.value, currencyCode)}
                      </p>
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
