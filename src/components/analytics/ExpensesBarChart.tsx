import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CATEGORY_COLORS, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

interface ExpenseBarChartProps {
  expenses: Expense[];
}

export const ExpenseBarChart = ({ expenses }: ExpenseBarChartProps) => {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const data = processMonthlyData(expenses).data;

  return (
    <div className="w-full h-[250px] md:h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={
            isMobile
              ? { top: 20, right: 0, left: 0, bottom: 20 }
              : { top: 20, right: 30, left: 0, bottom: 5 }
          }
          barCategoryGap={isMobile ? "15%" : "20%"}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(val) => formatCurrency(val as number, currencyCode)} />
          <Tooltip formatter={(val: number) => formatCurrency(val, currencyCode)} />
          {/* Render a separate Bar for each category */}
          {Object.keys(CATEGORY_COLORS).map((cat) =>
            data.some((item) => item.category === cat) ? (
              <Bar
                key={cat}
                dataKey={cat}
                fill={CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]}
              />
            ) : null
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
