
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface BudgetComparisonProps {
  budgets: Budget[];
}

export function BudgetComparison({ budgets }: BudgetComparisonProps) {
  const isMobile = useIsMobile();
  
  // Group budgets by period and calculate totals
  const budgetsByPeriod = budgets.reduce((acc, budget) => {
    if (!acc[budget.period]) {
      acc[budget.period] = {
        period: budget.period,
      };
    }
    acc[budget.period][budget.category] = budget.amount;
    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(budgetsByPeriod);

  // If no budgets or only one period, show message
  if (budgets.length === 0 || Object.keys(budgetsByPeriod).length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-muted-foreground mb-2">Not enough data for comparison</p>
        <p className="text-sm text-muted-foreground">
          {budgets.length === 0 
            ? "Add your first budget to see comparisons" 
            : "Add budgets with different periods (monthly, quarterly, yearly) to see comparisons"}
        </p>
      </div>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <CardHeader className={isMobile ? "p-3" : "p-4"}>
        <CardTitle className="text-lg">Budget Comparison by Period</CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "h-[300px] px-0 py-2" : "h-[400px] p-4"}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={
              isMobile 
                ? { top: 20, right: 10, left: 10, bottom: 60 } 
                : { top: 20, right: 30, left: 20, bottom: 5 }
            }
            layout={isMobile ? "vertical" : "horizontal"}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={!isMobile} horizontal={isMobile} />
            {isMobile ? (
              <>
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `${value/1000}k`} 
                  tick={{ fontSize: 12 }}
                  domain={[0, 'dataMax']}
                />
                <YAxis 
                  type="category" 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  width={70}
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey="period" 
                  height={60}
                  tick={{ fontSize: 14 }}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(Number(value))} 
                  width={60}
                  tick={{ fontSize: 14 }}
                />
              </>
            )}
            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="font-semibold mb-1">{label}</p>
                    {payload.map((entry) => (
                      <p 
                        key={entry.name} 
                        className="text-sm"
                        style={{ color: entry.color as string }}
                      >
                        {entry.name}: {formatCurrency(Number(entry.value))}
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
                fill={color}
                stackId={isMobile ? "a" : undefined}
                layout={isMobile ? "vertical" : "horizontal"}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
