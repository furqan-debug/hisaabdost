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
  const data = processMonthlyData(expenses);
  
  // Filter out zero-value categories for cleaner display
  const activeCategories = Object.keys(CATEGORY_COLORS).filter(category => {
    return data.some(item => item[category] > 0);
  });
  
  // CHANGE #1: The line that was limiting to the top 3 categories has been removed.
  // Now it will show ALL active categories.
  const allActiveCategories = activeCategories;
  
  // The outer div with a fixed height has been REMOVED.
  // The ResponsiveContainer will now correctly fill the space provided by ChartContainer.
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={isMobile ? { top: 20, right: 0, left: 0, bottom: 20 } : { top: 20, right: 30, left: 0, bottom: 5 }}
        barCategoryGap={isMobile ? "15%" : "30%"}
        maxBarSize={isMobile ? 24 : 40}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
          dy={8}
          interval={isMobile ? 1 : 0}
          height={isMobile ? 30 : 40}
        />
        <YAxis 
          // CHANGE #2: Added a domain to prevent bars from going below the 0 line.
          domain={[0, 'dataMax']}
          tickFormatter={(value) => {
            if (isMobile) {
              if (value >= 1000) return `${Math.floor(value / 1000)}k`;
              return value.toString();
            }
            return formatCurrency(value, currencyCode);
          }}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
          width={isMobile ? 30 : 60}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            
            const filteredPayload = payload.filter(entry => {
              const value = entry.value !== undefined ? Number(entry.value) : 0;
              return value > 0;
            });
          
            return (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="tooltip-card bg-popover text-popover-foreground"
              >
                <div className="text-sm font-medium mb-1">{label}</div>
                <div className="space-y-1">
                  {filteredPayload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs truncate max-w-[90px]">{entry.name}</span>
                      </div>
                      <span className="text-xs font-medium">
                        {formatCurrency(Number(entry.value), currencyCode)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          }}
        />
        {/* CHANGE #3: This now maps over ALL categories, not just the top 3. */}
        {allActiveCategories.map(category => (
          <Bar
            key={category}
            dataKey={category}
            fill={CATEGORY_COLORS[category]}
            radius={[4, 4, 0, 0]}
            maxBarSize={isMobile ? 24 : 40}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};