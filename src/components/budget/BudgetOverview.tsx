
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
    color: CATEGORY_COLORS[budget.category as keyof typeof CATEGORY_COLORS]
  }));

  // If no budgets, show message
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
        <p className="text-muted-foreground">No budget categories found</p>
        <p className="text-sm text-muted-foreground">Add your first budget to see an overview here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <CardHeader className={isMobile ? "p-3" : "p-4"}>
          <CardTitle className="text-lg">Budget Distribution</CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "h-[300px] px-0 py-2" : "h-[400px] p-4"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={isMobile ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: 0, right: 30, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 0 : 30}
                outerRadius={isMobile ? 80 : 140}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value, percent }) => 
                  isMobile 
                    ? `${Math.round(percent * 100)}%`
                    : `${name}: ${formatCurrency(value)}`
                }
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
                        {Math.round((Number(data.value) / totalBudget) * 100)}% of total
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
    </div>
  );
}
