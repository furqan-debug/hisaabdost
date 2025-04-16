
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { formatCurrency } from "@/utils/formatters";
import { format, parseISO } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { useIsMobile } from "@/hooks/use-mobile";

interface Expense {
  amount: number;
  category: string;
  date: string;
}

interface ExpensesLineChartProps {
  expenses: Expense[];
}

export function ExpensesLineChart({ expenses }: ExpensesLineChartProps) {
  const { currencyCode } = useCurrency();
  const isMobile = useIsMobile();
  
  const data = expenses.reduce((acc, expense) => {
    const month = format(parseISO(expense.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = {};
    }
    acc[month][expense.category] = (acc[month][expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const chartData = Object.entries(data)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, categories]) => ({
      month,
      ...categories
    }));

  // Only show top categories to improve performance and readability
  const topCategories = Object.keys(CATEGORY_COLORS)
    .filter(category => 
      chartData.some(item => item[category] && item[category] > 0)
    )
    .sort((a, b) => {
      const totalA = chartData.reduce((sum, item) => sum + (item[a] || 0), 0);
      const totalB = chartData.reduce((sum, item) => sum + (item[b] || 0), 0);
      return totalB - totalA;
    })
    .slice(0, isMobile ? 3 : 5);

  return (
    <div className="w-full h-[300px] overflow-visible">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
            dy={8}
            interval={isMobile ? 1 : 0}
          />
          <YAxis 
            tickFormatter={(value) => {
              if (isMobile && value >= 1000) {
                return `${Math.floor(value / 1000)}k`;
              }
              return formatCurrency(value, currencyCode);
            }}
            tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
            width={isMobile ? 30 : 60}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <p className="text-sm font-semibold">{label}</p>
                  {payload
                    .filter(entry => Number(entry.value) > 0)
                    .slice(0, isMobile ? 3 : 5)
                    .map((entry) => (
                      <p
                        key={entry.name}
                        className="text-sm"
                        style={{ color: entry.stroke }}
                      >
                        {entry.name}: {formatCurrency(entry.value as number, currencyCode)}
                      </p>
                    ))}
                </div>
              );
            }}
          />
          
          {/* Only render top categories */}
          {topCategories.map((category) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={CATEGORY_COLORS[category]}
              strokeWidth={isMobile ? 1.5 : 2}
              dot={{
                r: isMobile ? 2 : 3,
                strokeWidth: isMobile ? 1 : 2,
                fill: "var(--background)",
                stroke: CATEGORY_COLORS[category]
              }}
              activeDot={{
                r: isMobile ? 4 : 5,
                strokeWidth: 2,
                fill: "var(--background)",
                stroke: CATEGORY_COLORS[category]
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
