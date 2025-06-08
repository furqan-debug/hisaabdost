
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";

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
      <div className="w-full max-w-full overflow-hidden">
        <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Monthly Budget Comparison</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">Not enough data for comparison</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {budgets.length === 0 
                    ? "Add your first budget to see monthly comparisons" 
                    : "Add budgets across different months to see comparisons"}
                </p>
              </div>
            </div>
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
    <div className="w-full max-w-full overflow-hidden">
      <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Monthly Budget Comparison</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {topCategories.map(category => (
                <div key={category} className="flex items-center gap-2 text-xs font-medium bg-background/50 px-3 py-1.5 rounded-full border border-border/30">
                  <span className="block w-3 h-3 rounded-full" style={{
                    backgroundColor: CATEGORY_COLORS[category]
                  }} />
                  <span className="truncate">{category}</span>
                </div>
              ))}
            </div>
            
            <div className="w-full p-4 rounded-xl bg-background/50 border border-border/30">
              <div className="w-full h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: isMobile ? 10 : 30,
                      left: isMobile ? 10 : 20,
                      bottom: isMobile ? 40 : 60
                    }}
                    barCategoryGap={isMobile ? "20%" : "30%"}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: isMobile ? 11 : 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      height={50}
                      interval={0}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: isMobile ? 10 : 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      tickFormatter={(value) => `${Math.round(value)}`}
                      width={isMobile ? 50 : 70}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const filteredPayload = payload.filter(
                          entry => Number(entry.value) > 0
                        );
                        return (
                          <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
                            <div className="font-semibold mb-2 text-foreground">{label}</div>
                            {filteredPayload.map((entry, idx) => (
                              <div className="flex items-center gap-2 my-1" key={entry.name}>
                                <span className="block w-3 h-3 rounded-full" style={{backgroundColor: entry.color}} />
                                <span className="text-sm text-foreground">{entry.name}:</span>
                                <span className="ml-auto font-semibold text-foreground">{formatCurrency(Number(entry.value), currencyCode)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    {topCategories.map(category => (
                      <Bar
                        key={category}
                        dataKey={category}
                        fill={CATEGORY_COLORS[category]}
                        radius={[2, 2, 0, 0]} 
                        maxBarSize={isMobile ? 25 : 35}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
