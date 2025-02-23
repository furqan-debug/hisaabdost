
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";

interface ExpenseBarChartProps {
  expenses: Expense[];
}

export const ExpenseBarChart = ({ expenses }: ExpenseBarChartProps) => {
  const chartData = processMonthlyData(expenses);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart 
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
                      {entry.name}: {formatCurrency(Number(entry.value))}
                    </p>
                  ))}
                </div>
              </div>
            );
          }}
        />
        <Legend />
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <Bar
            key={category}
            dataKey={category}
            name={category}
            fill={color}
            barSize={20}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
