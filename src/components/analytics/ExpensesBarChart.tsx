import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { useAllCategories } from "@/hooks/useAllCategories";

interface ExpensesBarChartProps {
  expenses: Expense[];
}

export function ExpensesBarChart({ expenses }: ExpensesBarChartProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const { categories } = useAllCategories();
  
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.value] = cat.color;
    return acc;
  }, {} as Record<string, string>);
  
  const data = processMonthlyData(expenses, categories.map(cat => cat.value));
  
  const getCategoryTotal = (category: string) => {
    return data.reduce((sum, item) => sum + (item[category] || 0), 0);
  };

  const activeCategories = Object.keys(categoryColors).filter(category => {
    return data.some(item => item[category] > 0);
  });

  const allCategoriesWithData = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a));
  
  return (
    <div className="w-full h-auto">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={isMobile ? { top: 20, right: 10, left: -10, bottom: 5 } : { top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
              dy={8}
              interval="preserveStartEnd"
              height={30}
            />
            <YAxis 
              domain={[0, 'dataMax']}
              tickCount={isMobile ? 3 : 5}
              allowDataOverflow={false}
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
              width={isMobile ? 35 : 60}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const filteredPayload = payload.filter(entry => Number(entry.value || 0) > 0);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm"
                  >
                    <div className="text-sm font-medium mb-1">{label}</div>
                    <div className="space-y-1">
                      {filteredPayload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs truncate max-w-[90px]">{entry.name}</span>
                          </div>
                          <span className="text-xs font-medium">{formatCurrency(Number(entry.value), currencyCode)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              }}
            />
            {allCategoriesWithData.map(category => (
              <Bar
                key={category}
                dataKey={category}
                fill={categoryColors[category]}
                radius={[4, 4, 0, 0]}
                maxBarSize={isMobile ? 28 : 40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {allCategoriesWithData.slice(0, isMobile ? 6 : 10).map(category => (
          <div 
            key={category} 
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: (categoryColors[category] || "#eee") + "22" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[category] }} />
            <span className="truncate">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}