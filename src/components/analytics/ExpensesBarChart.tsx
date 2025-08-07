
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
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
  
  // Create category colors map from all categories
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.value] = cat.color;
    return acc;
  }, {} as Record<string, string>);
  
  const data = processMonthlyData(expenses, categories.map(cat => cat.value));
  
  // Filter out zero-value categories for cleaner display
  const activeCategories = Object.keys(categoryColors).filter(category => {
    return data.some(item => item[category] > 0);
  });
  
  // Show all categories with data (not just top categories)
  const getCategoryTotal = (category: string) => {
    return data.reduce((sum, item) => sum + (item[category] || 0), 0);
  };

  const allCategoriesWithData = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a));
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={isMobile ? { top: 20, right: 10, left: -10, bottom: 20 } : { top: 20, right: 30, left: 0, bottom: 5 }}
          barCategoryGap={isMobile ? "20%" : "30%"}
          maxBarSize={isMobile ? 28 : 40}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--foreground)' }}
            dy={8}
            interval={isMobile ? "preserveStartEnd" : 0}
            height={40}
          />
          <YAxis 
            tickFormatter={(value) => {
              if (isMobile) {
                // Simplified formatter for mobile to save space
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
              
              // Filter out items with zero value to reduce tooltip size
              const filteredPayload = payload.filter(entry => {
                // Convert ValueType to number for safe comparison
                const value = entry.value !== undefined ? Number(entry.value) : 0;
                return value > 0;
              }); // Limit to top 3 for cleaner mobile display
            
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
          {/* Render bars for all categories with data */}
          {allCategoriesWithData.map(category => (
            <Bar
              key={category}
              dataKey={category}
              fill={categoryColors[category]}
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 28 : 40}
              animationDuration={800}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      {/* Mobile-friendly legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-3 max-w-full overflow-hidden">
        {allCategoriesWithData.map(category => (
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
              {category.length > (isMobile ? 8 : 12) ? 
                category.slice(0, isMobile ? 8 : 12) + "…" : 
                category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
