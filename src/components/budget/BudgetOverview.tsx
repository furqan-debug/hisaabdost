
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
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
  const data = budgets.map(budget => ({
    name: budget.category,
    value: budget.amount,
    color: CATEGORY_COLORS[budget.category as keyof typeof CATEGORY_COLORS],
    percentage: (budget.amount / totalBudget * 100).toFixed(0)
  }));

  if (budgets.length === 0) {
    return <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-3 w-full">
      <p className="text-muted-foreground">No budget categories found</p>
      <p className="text-sm text-muted-foreground">Add your first budget to see an overview here</p>
    </div>;
  }

  return (
    <div className="space-y-4 w-full">
      <Card className="budget-card">
        <CardHeader className="p-3">
          <CardTitle className="text-lg">Budget Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2 min-h-[280px]">
          <div className="w-full" style={{ minHeight: '280px', height: 'auto' }}>
            <ResponsiveContainer width="100%" height={300} minHeight={280}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 80 : 120}
                  dataKey="value"
                  label={({ name, percentage }) => 
                    isMobile ? `${percentage}%` : `${name}: ${percentage}%`
                  }
                  labelLine={!isMobile}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0];
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="text-sm font-semibold">
                          {data.name}: {formatCurrency(Number(data.value), currencyCode)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.payload.percentage}% of total
                        </p>
                      </div>
                    );
                  }}
                />
                {!isMobile && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {isMobile && (
        <div className="mt-3 space-y-2 px-1">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-md"
              style={{ backgroundColor: `${item.color}20` }}
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 mr-2 rounded-sm" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              <div>
                <span className="text-sm font-semibold">
                  {formatCurrency(item.value, currencyCode)}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
