import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface ExpenseLineChartProps {
  expenses: Expense[];
}

export const ExpenseLineChart = ({ expenses }: ExpenseLineChartProps) => {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const data = processMonthlyData(expenses).data;

  return (
    <div className="w-full h-[250px] md:h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(val) => formatCurrency(val as number, currencyCode)} />
          <Tooltip formatter={(val: number) => formatCurrency(val, currencyCode)} />
          <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
