
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";

interface ExpenseLineChartProps {
  expenses: Expense[];
}

export const ExpenseLineChart = ({ expenses }: ExpenseLineChartProps) => {
  const chartData = processMonthlyData(expenses);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart 
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={(value) => `$${Number(value)/1000}k`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            
            const validData = payload.filter(p => Number(p.value) > 0);
            
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="text-sm font-semibold">{label}</p>
                {validData.map((entry) => (
                  <p 
                    key={entry.name}
                    className="text-sm"
                    style={{ color: entry.color }}
                  >
                    {entry.name}: {formatCurrency(Number(entry.value))}
                  </p>
                ))}
              </div>
            );
          }}
        />
        <Legend />
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            name={category}
            stroke={color}
            strokeWidth={2}
            dot={{ 
              fill: color,
              r: 4,
              strokeWidth: 2,
              stroke: 'var(--background)'
            }}
            activeDot={{ 
              r: 6,
              stroke: color,
              strokeWidth: 2,
              fill: 'var(--background)'
            }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
