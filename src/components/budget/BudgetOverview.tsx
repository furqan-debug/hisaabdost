
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
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
    percentage: (budget.amount / totalBudget * 100).toFixed(0)
  }));

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] py-8 px-4 text-center space-y-3 w-full">
        <p className="text-muted-foreground">No budget categories found</p>
        <p className="text-sm text-muted-foreground">Add your first budget to see an overview here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full h-full min-h-[500px]">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Budget Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] px-2 md:px-6">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 80 : 110}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]}
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
          
          {/* Mobile-friendly legend */}
          {isMobile && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor: CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]
                    }}
                  />
                  <span className="truncate">{entry.name}</span>
                  <span className="ml-auto">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
