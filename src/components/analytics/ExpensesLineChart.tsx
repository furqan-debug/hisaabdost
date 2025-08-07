
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { processMonthlyData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from '@/hooks/use-currency';
import { motion } from "framer-motion";
import { Expense } from "@/components/expenses/types";
import { useAllCategories } from "@/hooks/useAllCategories";

interface ExpensesLineChartProps {
  expenses: Expense[];
}

export function ExpensesLineChart({
  expenses
}: ExpensesLineChartProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const { categories } = useAllCategories();
  
  // Create category colors map from all categories
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.value] = cat.color;
    return acc;
  }, {} as Record<string, string>);
  
  const data = processMonthlyData(expenses, categories.map(cat => cat.value));
  // --- START: New code to add ---
  // This manually calculates the highest value for the Y-axis
  const allValues = data.flatMap(month => 
    Object.values(month).filter((val): val is number => typeof val === 'number')
  );
  const maxValue = Math.max(0, ...allValues);
  
  // This creates an array with exactly three points: 0, halfway, and the top
  const yAxisTicks = [0, Math.ceil(maxValue / 2), Math.ceil(maxValue)];
  // --- END: New code to add ---

  // Only show categories with non-zero data
  const activeCategories = Object.keys(categoryColors).filter(category => 
    data.some(item => item[category] > 0)
  );

  // Show all categories with data (not just top categories)
  const getCategoryTotal = (category: string) => 
    data.reduce((sum, item) => sum + (item[category] || 0), 0);
  
  const allCategoriesWithData = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a));

  // Calculate average value for all categories for reference line
  const avgValue = allCategoriesWithData.length > 0 
    ? allCategoriesWithData.reduce((sum, category) => sum + getCategoryTotal(category), 0) / allCategoriesWithData.length / data.length
    : 0;

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={isMobile ? 
            { top: 20, right: 10, left: -10, bottom: 20 } : 
            { top: 20, right: 30, left: 0, bottom: 5 }
          }
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 11 : 13, fill: 'var(--foreground)' }}
            dy={8}
            interval={isMobile ? 1 : 0}
            height={40}
          />
          <YAxis 
            // This forces the chart to use our 3 calculated points
            ticks={yAxisTicks}
            domain={[0, 'dataMax']}
            allowDataOverflow={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
            width={isMobile ? 35 : 60}
            tickFormatter={(value) => {
              if (isMobile) {
                if (value >= 1000) return `${Math.floor(value / 1000)}k`;
                return value.toString();
              }
              return formatCurrency(value, currencyCode);
            }}
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
          
          {/* Render lines for all categories with data */}
          {allCategoriesWithData.map(category => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={categoryColors[category]}
              strokeWidth={isMobile ? 2 : 2.5}
              dot={{
                r: isMobile ? 3 : 4,
                strokeWidth: isMobile ? 1.5 : 2,
                fill: "var(--background)",
                stroke: categoryColors[category]
              }}
              activeDot={{
                r: isMobile ? 5 : 6,
                strokeWidth: 2,
                fill: "var(--background)",
                stroke: categoryColors[category]
              }}
              animationDuration={1000}
              animationBegin={500}
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Mobile-friendly legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {allCategoriesWithData.slice(0, isMobile ? 6 : 10).map(category => (
          <div 
            key={category} 
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: (categoryColors[category] || "#eee") + "22" }}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: categoryColors[category] }}
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
