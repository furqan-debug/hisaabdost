
import React from 'react';
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
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={processMonthlyData(expenses)}
        margin={isMobile ? { top: 20, right: 10, left: 0, bottom: 20 } : { top: 20, right: 30, left: 0, bottom: 5 }}
        barCategoryGap={isMobile ? "20%" : "30%"}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 11 : 12, fill: 'var(--foreground)' }}
          dy={8}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value, currencyCode)}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 11 : 12, fill: 'var(--foreground)' }}
          width={isMobile ? 65 : 80}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="tooltip-card"
              >
                <div className="text-sm font-medium mb-2">{label}</div>
                <div className="space-y-1.5">
                  {payload.map((entry: any, index: number) => (
                    entry.value > 0 && (
                      <div key={index} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm">{entry.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(entry.value, currencyCode)}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </motion.div>
            );
          }}
        />
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <Bar
            key={category}
            dataKey={category}
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
