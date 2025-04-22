
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import clsx from "clsx";

interface BudgetComparisonProps {
  budgets: Budget[];
}

export function BudgetComparison({ budgets }: BudgetComparisonProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  // Aggregate budgets by period, with totals per category
  const budgetsByPeriod = budgets.reduce((acc, budget) => {
    if (!acc[budget.period]) {
      acc[budget.period] = { period: budget.period };
    }
    acc[budget.period][budget.category] = budget.amount;
    return acc;
  }, {} as Record<string, any>);
  const data = Object.values(budgetsByPeriod);

  // Remove periods with no amounts
  if (budgets.length === 0 || Object.keys(budgetsByPeriod).length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] md:h-[300px] py-8 px-4 text-center">
        <p className="text-muted-foreground mb-2">Not enough data for comparison</p>
        <p className="text-sm text-muted-foreground">
          {budgets.length === 0 
            ? "Add your first budget to see comparisons" 
            : "Add budgets with different periods to see comparisons"}
        </p>
      </div>
    );
  }

  // Filter to only categories in use (with any value)
  const activeCategories = Object.keys(CATEGORY_COLORS).filter(category => 
    data.some(item => item[category] > 0)
  );

  // Use only first 6 (or 8 if mobile) categories by total for clarity
  const getCategoryTotal = (category: string) => 
    data.reduce((sum, item) => sum + (item[category] || 0), 0);

  const topCategories = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a))
    .slice(0, isMobile ? 4 : 6);

  // For display-friendly period labels
  const formatPeriodShort = (period: string) => {
    // Example: "Apr 2024", "Mar 2024" or just show month/year
    return period.length > 9 ? period.slice(0, 9) + "…" : period;
  };

  return (
    <Card className="overflow-hidden rounded-xl shadow-md border bg-card">
      <CardHeader>
        <CardTitle>Budget Comparison by Period</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Modern pastel rounded container */}
        <div
          className={clsx(
            "w-full py-2 px-2 md:px-6 rounded-lg bg-[hsl(var(--muted)/0.5)] border border-border/50",
            "backdrop-blur-sm"
          )}
        >
          {/* Clean horizontal legend above the chart */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 justify-center">
            {topCategories.map(category => (
              <div key={category} className="flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                <span className="block w-3 h-3 rounded-full mr-1" style={{
                  backgroundColor: CATEGORY_COLORS[category]
                }} />
                <span className="truncate">{category}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-[270px] md:h-[350px] flex items-center justify-center">
            <BarChart
              layout="vertical"
              data={data}
              margin={{
                top: 10,
                right: isMobile ? 8 : 40,
                left: isMobile ? 30 : 60,
                bottom: 8
              }}
              barCategoryGap={isMobile ? "18%" : "26%"}
              className="w-full"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.11} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: isMobile ? 11 : 13,
                  fill: "var(--muted-foreground)",
                }}
                width={80}
                tickFormatter={value => formatCurrency(value, currencyCode)}
              />
              <YAxis
                type="category"
                dataKey="period"
                axisLine={false}
                tickLine={false}
                width={isMobile ? 60 : 90}
                tick={{
                  fontSize: isMobile ? 12 : 15,
                  fill: "var(--foreground)",
                  fontWeight: 500
                }}
                tickFormatter={formatPeriodShort}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.25 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  // Only show nonzero categories for this period
                  const filteredPayload = payload.filter(
                    entry => Number(entry.value) > 0
                  );
                  return (
                    <div className="rounded-lg border bg-background/80 p-2 shadow text-xs">
                      <div className="font-semibold mb-1">{label}</div>
                      {filteredPayload.map((entry, idx) => (
                        <div className="flex items-center gap-1 my-0.5" key={entry.name}>
                          <span className="block w-2.5 h-2.5 rounded-full" style={{backgroundColor: entry.color}} />
                          <span>{entry.name}:</span>
                          <span className="ml-1 font-semibold">{formatCurrency(Number(entry.value), currencyCode)}</span>
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
                  radius={[12, 12, 12, 12]}
                  barSize={isMobile ? 17 : 24}
                  background={false}
                  className="transition-all"
                />
              ))}
            </BarChart>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
