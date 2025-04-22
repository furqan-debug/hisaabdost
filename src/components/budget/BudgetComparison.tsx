
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface BudgetComparisonProps {
  budgets: Budget[];
}

export function BudgetComparison({ budgets }: BudgetComparisonProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  const budgetsByPeriod = budgets.reduce((acc, budget) => {
    if (!acc[budget.period]) {
      acc[budget.period] = { period: budget.period };
    }
    acc[budget.period][budget.category] = budget.amount;
    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(budgetsByPeriod);

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

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Budget Comparison by Period</CardTitle>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        <div className="w-full h-[250px] md:h-[300px] overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={isMobile ? { top: 20, right: 0, left: -15, bottom: 0 } : { top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="period"
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={60}
                interval={0}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value, currencyCode)}
                width={isMobile ? 50 : 60}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <p className="font-semibold mb-1 capitalize">{label}</p>
                      {payload.map((entry) => (
                        <p 
                          key={entry.name}
                          className="text-sm"
                          style={{ color: entry.color as string }}
                        >
                          {entry.name}: {formatCurrency(Number(entry.value), currencyCode)}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              {!isMobile && <Legend />}
              {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="a"
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Mobile legend */}
        {isMobile && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
              <div key={category} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                <span className="text-sm truncate">{category}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
