
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency } from "@/hooks/use-currency-context";

interface ExpenseBarChartProps {
  expenses: Expense[];
}

export const ExpenseBarChart = ({ expenses }: ExpenseBarChartProps) => {
  const chartData = processMonthlyData(expenses);
  const isMobile = useIsMobile();
  const { currencySymbol } = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
      <BarChart 
        data={chartData}
        margin={isMobile ? { top: 15, right: 5, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
        barCategoryGap={isMobile ? "20%" : "30%"}
        barGap={isMobile ? 2 : 4}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
        <YAxis 
          tickFormatter={(value) => `${currencySymbol}${Number(value)/1000}k`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12 }}
          width={isMobile ? 30 : 40}
        />
        <Tooltip
          cursor={{ fillOpacity: 0.1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            
            // Filter out categories with no expenses (value === 0 or null)
            const validData = payload.filter(p => p.value && Number(p.value) > 0);
            
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="text-sm font-semibold">{label}</p>
                <div className="space-y-1">
                  {validData.map((entry) => (
                    <p 
                      key={entry.name}
                      className="text-sm"
                      style={{ color: entry.color }}
                    >
                      {entry.name}: {formatCurrency(Number(entry.value), currencySymbol)}
                    </p>
                  ))}
                </div>
              </div>
            );
          }}
        />
        <Legend wrapperStyle={isMobile ? { fontSize: '10px' } : undefined} />
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <Bar
            key={category}
            dataKey={category}
            name={category}
            fill={color}
            fillOpacity={0.85}
            barSize={isMobile ? 4 : 10}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
