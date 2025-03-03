
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const isMobile = useIsMobile();
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

  const data = budgets.map(budget => ({
    name: budget.category,
    value: budget.amount,
    color: CATEGORY_COLORS[budget.category as keyof typeof CATEGORY_COLORS],
    percentage: ((budget.amount / totalBudget) * 100).toFixed(0)
  }));

  // If no budgets, show message
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-3">
        <p className="text-muted-foreground">No budget categories found</p>
        <p className="text-sm text-muted-foreground">Add your first budget to see an overview here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full overflow-hidden max-w-full">
      <Card className="budget-card overflow-hidden w-full max-w-full">
        <CardHeader className="p-3">
          <CardTitle className="text-lg">Budget Distribution</CardTitle>
        </CardHeader>
        <CardContent className="budget-chart-container p-0 pb-2 max-w-full overflow-hidden">
          <ResponsiveContainer width="99%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 80 : 150}
                dataKey="value"
                label={({ name, percentage }) => isMobile ? `${percentage}%` : `${name}: ${percentage}%`}
                labelLine={!isMobile}
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
                        {data.name}: {formatCurrency(Number(data.value))}
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
        </CardContent>
      </Card>
      
      {isMobile && (
        <div className="mt-3 space-y-2 w-full overflow-hidden max-w-full">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-md w-full"
              style={{ backgroundColor: `${item.color}20` }}
            >
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
                <span className="font-medium text-sm truncate max-w-[120px]">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                <span className="text-xs text-muted-foreground ml-2">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
