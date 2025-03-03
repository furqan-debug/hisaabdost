
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
    <Card className="budget-card">
      <CardHeader className="p-3">
        <CardTitle className="text-lg">Budget Comparison by Period</CardTitle>
      </CardHeader>
      <CardContent className="budget-chart-container p-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={
              isMobile 
                ? { top: 20, right: 5, left: 0, bottom: 60 } 
                : { top: 20, right: 30, left: 20, bottom: 5 }
            }
            barGap={isMobile ? 2 : 8}
            barSize={isMobile ? 15 : 30}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={!isMobile} />
            <XAxis 
              dataKey="period" 
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
              tick={{ fontSize: isMobile ? 12 : 14 }}
            />
            <YAxis 
              tickFormatter={(value) => isMobile ? `${value/1000}k` : formatCurrency(Number(value))} 
              width={isMobile ? 40 : 60}
              tick={{ fontSize: isMobile ? 12 : 14 }}
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
                stackId="a"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      
      {isMobile && (
        <div className="p-3 pt-0">
          <h4 className="text-sm font-medium mb-2">Legend:</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
              <div key={category} className="flex items-center">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: color }}></div>
                <span className="text-xs">{category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
