import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { CATEGORY_COLORS, processMonthlyData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from '@/hooks/use-currency';
import { motion } from "framer-motion";
import { Expense } from "@/components/expenses/types";

interface ExpensesLineChartProps {
  expenses: Expense[];
}

export function ExpensesLineChart({ expenses }: ExpensesLineChartProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const data = processMonthlyData(expenses);

  // Only show categories with non-zero data
  const activeCategories = Object.keys(CATEGORY_COLORS).filter(category =>
    data.some(item => item[category] > 0)
  );
  
  // Sort categories by total amount and limit to top 3-5 depending on screen size
  const getCategoryTotal = (category: string) =>
    data.reduce((sum, item) => sum + (item[category] || 0), 0);

  const topCategories = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a))
    .slice(0, isMobile ? 3 : 5);
    
  // Find average value for reference line
  const allValues = data.flatMap(item => 
    topCategories.map(cat => item[cat] || 0).filter(val => val > 0)
  );
  const avgValue = allValues.length > 0 
    ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length 
    : 0;

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={data}
          margin={isMobile ? { top: 15, right: 5, left: 0, bottom: 20 } : { top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 11 : 13, fill: 'var(--foreground)' }}
            dy={8}
            interval={isMobile ? 1 : 0}
            height={25}
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
          
          {avgValue > 0 && (
            <ReferenceLine 
              y={avgValue} 
              stroke="#8884d8" 
              strokeDasharray="3 3" 
              strokeOpacity={0.4} 
            />
          )}
          
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              
              // Filter out zero values and limit entries for mobile
              const filteredPayload = payload
                .filter(entry => Number(entry.value) > 0)
                .slice(0, isMobile ? 3 : 5);
                
              return (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border bg-background/95 px-3 py-2 shadow-md backdrop-blur-sm"
                >
                  <p className="text-sm font-semibold mb-1">{label}</p>
                  <div className="space-y-1">
                    {filteredPayload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.stroke }}
                          />
                          <span className="truncate max-w-[90px]">{entry.name}</span>
                        </div>
                        <span className="font-medium">
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
              strokeWidth={isMobile ? 2 : 2.5}
              dot={{
                r: isMobile ? 3 : 4,
                strokeWidth: isMobile ? 1.5 : 2,
                fill: "var(--background)",
                stroke: CATEGORY_COLORS[category]
              }}
              activeDot={{
                r: isMobile ? 5 : 6,
                strokeWidth: 2,
                fill: "var(--background)",
                stroke: CATEGORY_COLORS[category]
              }}
              animationDuration={1000}
              animationBegin={500}
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Mobile-friendly legend */}
      <div className="chart-legend-row">
        {topCategories.map(category => (
          <div 
            key={category} 
            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: (CATEGORY_COLORS[category] || "#eee") + "22" }}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: CATEGORY_COLORS[category] }} 
            />
            <span className="truncate">
              {category.length > 12 ? category.slice(0, 12) + "…" : category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
