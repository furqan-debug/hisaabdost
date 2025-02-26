
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { format, parseISO } from "date-fns";

interface Expense {
  amount: number;
  category: string;
  date: string;
}

interface ExpensesLineChartProps {
  expenses: Expense[];
}

export function ExpensesLineChart({ expenses }: ExpensesLineChartProps) {
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="text-sm font-semibold">{label}</p>
                {payload.map((entry) => (
                  <p
                    key={entry.name}
                    className="text-sm"
                    style={{ color: entry.color }}
                  >
                    {entry.name}: {formatCurrency(entry.value as number)}
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
            stroke={color}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
