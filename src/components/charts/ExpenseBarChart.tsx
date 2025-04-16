
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CATEGORY_COLORS, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface ExpenseBarChartProps {
  expenses: Expense[];
}

export const ExpenseBarChart = ({ expenses }: ExpenseBarChartProps) => {
  const chartData = processMonthlyData(expenses);
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  // Get top 5 categories
  const topCategories = getTopCategories(expenses, 5);

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
      <BarChart 
        data={chartData}
        margin={isMobile ? { top: 20, right: 0, left: -15, bottom: 5 } : { top: 20, right: 30, left: 0, bottom: 5 }}
        barCategoryGap="30%"
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          horizontal={true}
          vertical={false}
        />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
        <YAxis 
          tickFormatter={(value) => `${formatCurrency(value, currencyCode)}`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12 }}
          width={isMobile ? 60 : 80}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            
            return (
              <div className="tooltip-card">
                <div className="text-sm font-medium mb-1">{label}</div>
                {payload.map((entry: any) => (
                  entry.value > 0 && (
                    <div 
                      key={entry.name}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span style={{ color: entry.color }}>{entry.name}</span>
                      <span className="font-medium">
                        {formatCurrency(entry.value, currencyCode)}
                      </span>
                    </div>
                  )
                ))}
              </div>
            );
          }}
        />
        {topCategories.map((category) => (
          <Bar
            key={category}
            dataKey={category}
            fill={CATEGORY_COLORS[category]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// Helper function to get top spending categories
const getTopCategories = (expenses: Expense[], limit: number): string[] => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([category]) => category);
};

