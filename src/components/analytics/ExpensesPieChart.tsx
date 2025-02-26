
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";

interface Expense {
  amount: number;
  category: string;
}

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const data = Object.entries(
    expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#A4DE6C',
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          innerRadius={75}
          paddingAngle={2}
          label={false}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="text-sm font-semibold" style={{ color: data.payload.color }}>
                  {data.name}: {formatCurrency(Number(data.value))}
                </p>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          formatter={(value, entry: any) => (
            <span style={{ color: entry.color }}>
              {value}: {formatCurrency(entry.payload.value)}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
