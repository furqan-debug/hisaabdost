
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
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

  // Get top 5 categories by total expense
  const topCategories = getTopCategories(expenses, 5);

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
      <BarChart 
        data={chartData}
        margin={isMobile ? { top: 15, right: 5, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
        barCategoryGap={isMobile ? "30%" : "40%"}
        barGap={isMobile ? 2 : 4}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
        />
        <YAxis 
          tickFormatter={(value) => `${formatCurrency(Number(value)/1000, currencyCode).split('.')[0]}k`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
          width={isMobile ? 30 : 40}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.05 }}
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            
            // Filter out categories with no expenses (value === 0 or null)
            const validData = payload.filter(p => p.value && Number(p.value) > 0);
            
            return (
              <div className="rounded-lg border bg-background/95 p-2 shadow-sm text-left">
                <p className="text-sm font-medium mb-1">{label}</p>
                <div className="space-y-1">
                  {validData.map((entry) => (
                    <p 
                      key={entry.name}
                      className="text-xs flex justify-between gap-2"
                    >
                      <span style={{ color: entry.color }}>{entry.name}:</span>
                      <span className="font-medium">{formatCurrency(Number(entry.value), currencyCode)}</span>
                    </p>
                  ))}
                </div>
              </div>
            );
          }}
        />
        <Legend 
          wrapperStyle={isMobile ? { fontSize: '10px', marginTop: '10px' } : { marginTop: '10px' }}
          iconSize={8}
          iconType="circle"
        />
        {topCategories.map((category) => (
          <Bar
            key={category}
            dataKey={category}
            name={category}
            fill={CATEGORY_COLORS[category]}
            fillOpacity={0.9}
            barSize={isMobile ? 6 : 12}
            radius={[3, 3, 0, 0]}
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
