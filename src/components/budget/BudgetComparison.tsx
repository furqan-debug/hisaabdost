import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
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

  // Group budgets by period (e.g., monthly, quarterly, yearly)
  const budgetsByPeriod = budgets.reduce((acc, budget) => {
    if (!acc[budget.period]) {
      acc[budget.period] = {
        period: budget.period
      };
    }
    // accumulate amount per category per period
    acc[budget.period][budget.category] = budget.amount;
    return acc;
  }, {} as Record<string, any>);
  const data = Object.values(budgetsByPeriod);

  if (budgets.length === 0 || Object.keys(budgetsByPeriod).length <= 1) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-muted-foreground mb-2">Not enough data for comparison</p>
        <p className="text-sm text-muted-foreground">
          {budgets.length === 0
            ? "Add your first budget to see comparisons"
            : "Add budgets with different periods (monthly, quarterly, yearly) to compare here"}
        </p>
      </div>
    );
  }

  return (
    <Card className="budget-card w-full max-w-full">
      <CardHeader className="p-3">
        <CardTitle className="text-lg">Budget Comparison by Period</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 200}>
          <BarChart
            data={data}
            margin={
              isMobile
                ? { top: 20, right: 15, left: -10, bottom: 60 }
                : { top: 20, right: 30, left: 20, bottom: 5 }
            }
            barCategoryGap={isMobile ? "15%" : "30%"}
            maxBarSize={isMobile ? 24 : 40}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={(val) => formatCurrency(val as number, currencyCode)} />
            <Tooltip
              formatter={(val: number, name: string) =>
                [formatCurrency(val, currencyCode), name]
              }
            />
            {!isMobile && <Legend />}
            {/* Dynamically render a Bar for each category in the data */}
            {Object.keys(CATEGORY_COLORS).map((category) =>
              data[0][category] !== undefined ? (
                <Bar
                  key={category}
                  dataKey={category}
                  name={category}
                  fill={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
                />
              ) : null
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
