
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { format, parseISO } from "date-fns";
import clsx from "clsx";

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
      <div className="flex flex-col items-center justify-center h-[250px] md:h-[300px] py-8 px-4 text-center">
        <p className="text-muted-foreground mb-2">Not enough data for monthly comparison</p>
        <p className="text-sm text-muted-foreground">
          {budgets.length === 0 
            ? "Add your first budget to see monthly comparisons" 
            : "Add budgets across different months to see comparisons"}
        </p>
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
    <Card className="overflow-hidden rounded-xl shadow-md border bg-card">
      <CardHeader>
        <CardTitle>Monthly Budget Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
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
        
        <div className={clsx(
          "w-full py-2 px-2 md:px-6 rounded-lg bg-[hsl(var(--muted)/0.5)] border border-border/50",
          "backdrop-blur-sm h-[270px] md:h-[350px]"
        )}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="horizontal" 
              data={data}
              margin={{
                top: 10,
                right: isMobile ? 8 : 30,
                left: isMobile ? 10 : 20,
                bottom: isMobile ? 30 : 40
              }}
              barCategoryGap={isMobile ? "20%" : "30%"}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.11} />
              <XAxis 
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: isMobile ? 11 : 13,
                  fill: "var(--muted-foreground)",
                }}
                height={40}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: isMobile ? 10 : 12,
                  fill: "var(--muted-foreground)",
                }}
                tickFormatter={(value) => `${value}`}
                width={isMobile ? 50 : 70}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.25 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const filteredPayload = payload.filter(
                    entry => Number(entry.value) > 0
                  );
                  return (
                    <div className="rounded-lg border bg-background/95 p-2 shadow-md text-xs backdrop-blur-sm">
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
                  radius={[4, 4, 4, 4]} 
                  maxBarSize={isMobile ? 20 : 30}
                  className="transition-all"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
