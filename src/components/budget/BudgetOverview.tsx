
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  // Process data for pie chart
  const data = budgets.map(budget => ({
    name: budget.category,
    value: budget.amount,
    color: CATEGORY_COLORS[budget.category as keyof typeof CATEGORY_COLORS],
    percentage: (budget.amount / totalBudget * 100).toFixed(0)
  }));

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-muted-foreground mb-2">No budget categories found</p>
        <p className="text-sm text-muted-foreground">Add your first budget to see an overview here</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      <Card className="flex-1 min-h-[300px]">
        <CardHeader className="p-3">
          <CardTitle className="text-lg">Budget Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-[300px]">
          <div className="relative w-full h-full min-h-[300px]">
            {/* Center total display */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
              <p className="text-2xl font-bold">{formatCurrency(totalBudget, currencyCode)}</p>
              <p className="text-sm text-muted-foreground">Total Budget</p>
            </div>
            
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 60 : 80}
                  outerRadius={isMobile ? 90 : 120}
                  paddingAngle={2}
                  cornerRadius={4}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="text-sm font-semibold">{data.name}</p>
                        <p className="text-sm">{formatCurrency(data.value, currencyCode)}</p>
                        <p className="text-xs text-muted-foreground">
                          {data.percentage}% of total
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 px-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm truncate">{entry.name}</span>
            <span className="text-sm font-medium">{entry.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
