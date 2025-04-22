
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CATEGORY_COLORS, processMonthlyData } from "@/utils/chartUtils";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { useIsMobile } from "@/hooks/use-mobile";

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  receiptUrl?: string;
}

interface ExpensesBarChartProps {
  expenses: Expense[];
}

export function ExpensesBarChart({ expenses }: ExpensesBarChartProps) {
  const { currencyCode } = useCurrency();
  const isMobile = useIsMobile();

  // Group by month and categories
  const chartData = processMonthlyData(expenses);

  // Chart categories present in data only
  const presentCategories = Object.keys(CATEGORY_COLORS).filter(category =>
    chartData.some(d => !!d[category])
  );

  return (
    <div className="w-full h-[220px] md:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: isMobile ? 10 : 30, right: 10, top: 10, bottom: 10 }}
          barCategoryGap="40%"
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
          <YAxis
            type="category"
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontWeight: 600, fontSize: isMobile ? 11 : 13, fill: "#888" }}
            width={isMobile ? 50 : 70}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tickFormatter={v => formatCurrency(v, currencyCode)}
            tick={{ fontWeight: 500, fontSize: isMobile ? 11 : 13, fill: "#B0BAC3" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <p className="text-xs font-semibold">{label}</p>
                  {payload.map((entry) => (
                    <p
                      key={entry.name}
                      className="text-xs"
                      style={{ color: entry.color }}
                    >
                      {entry.name}: {formatCurrency(entry.value as number, currencyCode)}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          {presentCategories.map((category, idx) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="a"
              fill={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
              radius={[10, 10, 10, 10]}
              minPointSize={2}
              barSize={isMobile ? 10 : 18}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
