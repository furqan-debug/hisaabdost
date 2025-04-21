import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface ExpensePieChartProps {
  expenses: Expense[];
}

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  const { data, totalAmount } = processMonthlyData(expenses);
  const mainSegment = data[0] || { name: "", value: 0 };
  const mainPct = totalAmount ? ((mainSegment.value / totalAmount) * 100).toFixed(0) : 0;

  return (
    <div className="relative w-full" style={{ height: isMobile ? 300 : 250 }}>
      <div className="chart-center-total">
        <div className="chart-center-total-amount">
          {formatCurrency(totalAmount, currencyCode)}
        </div>
        <div className="chart-center-total-label">Total</div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) =>
              [formatCurrency(value, currencyCode), name]
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
