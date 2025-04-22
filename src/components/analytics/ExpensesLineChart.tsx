
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CATEGORY_COLORS, processMonthlyData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { Expense } from "@/components/expenses/types";

interface ExpensesLineChartProps {
  expenses: Expense[];
}

export function ExpensesLineChart({ expenses }: ExpensesLineChartProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const data = processMonthlyData(expenses);

  // Only nonzero categories
  const activeCategories = Object.keys(CATEGORY_COLORS).filter(category =>
    data.some(item => item[category] > 0)
  );
  // Top by value
  const getCategoryTotal = (category: string) =>
    data.reduce((sum, item) => sum + (item[category] || 0), 0);

  const topCategories = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a))
    .slice(0, isMobile ? 3 : 5);

  return (
    <div className="w-full h-[300px] md:h-[330px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={isMobile ? { top: 20, right: 0, left: 0, bottom: 20 } : { top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="2 4" vertical={false} opacity={0.13} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 11 : 13, fill: 'var(--foreground)' }}
            dy={8}
            interval={isMobile ? 1 : 0}
            height={isMobile ? 30 : 40}
          />
          <YAxis
            tickFormatter={(value) => {
              if (isMobile) {
                if (value >= 1000) return `${Math.floor(value / 1000)}k`;
                return value.toString();
              }
              return formatCurrency(value, currencyCode);
            }}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 11 : 13, fill: 'var(--foreground)' }}
            width={isMobile ? 30 : 60}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              const filteredPayload = payload
                .filter(entry => Number(entry.value) > 0)
                .slice(0, isMobile ? 3 : 5);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border bg-background/95 px-3 py-2 shadow-md text-xs min-w-[120px]"
                >
                  <div className="font-semibold mb-0.5">{label}</div>
                  <div>
                    {filteredPayload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.stroke }}
                        />
                        <span className="text-xs truncate max-w-[90px]">{entry.name}</span>
                        <span className="ml-1 font-medium">
                          {formatCurrency(Number(entry.value), currencyCode)}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            }}
          />
          {/* Only render lines for top categories */}
          {topCategories.map(category => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={CATEGORY_COLORS[category]}
              strokeWidth={isMobile ? 2 : 3}
              dot={{
                r: isMobile ? 2.5 : 4,
                strokeWidth: isMobile ? 1 : 2,
                fill: "var(--background)",
                stroke: CATEGORY_COLORS[category]
              }}
              activeDot={{
                r: isMobile ? 4 : 6,
                strokeWidth: 2,
                fill: "var(--background)",
                stroke: CATEGORY_COLORS[category]
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-legend-row">
        {topCategories.map(cat => (
          <div key={cat} className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{background: (CATEGORY_COLORS[cat] || "#eee") + "22"}}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
            <span className="truncate">{cat.length > 12 ? cat.slice(0, 12)+"…" : cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
