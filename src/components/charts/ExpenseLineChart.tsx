
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpenseLineChartProps {
  expenses: Expense[];
}

export const ExpenseLineChart = ({ expenses }: ExpenseLineChartProps) => {
  const chartData = processMonthlyData(expenses);
  const isMobile = useIsMobile();
  
  // Get active categories (ones that have values)
  const activeCategories = Object.keys(CATEGORY_COLORS).filter(category => 
    chartData.some(item => item[category] !== null && item[category] > 0)
  );

  // Chart height based on device
  const chartHeight = isMobile ? 290 : 400;
  
  // Limit data points on mobile
  const limitedData = isMobile && chartData.length > 5 
    ? chartData.slice(-5) // Show only the last 5 months on mobile
    : chartData;

  return (
    <ResponsiveContainer width="100%" height={chartHeight} className="line-chart-container">
      <LineChart 
        data={limitedData}
        margin={isMobile ? { top: 10, right: 5, left: -18, bottom: 5 } : { top: 20, right: 15, left: 0, bottom: 5 }}
        className="overflow-visible"
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false}
          horizontal={true}
          opacity={0.15}
        />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 8 : 12, fill: 'var(--muted-foreground)' }}
          dy={8}
          height={isMobile ? 15 : 30}
        />
        <YAxis 
          tickFormatter={(value) => `$${(Number(value)/1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 8 : 12, fill: 'var(--muted-foreground)' }}
          width={isMobile ? 25 : 45}
          tickCount={5}
        />
        <Tooltip
          cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '3 3' }}
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            
            // Only show categories that have actual values (not null)
            const validData = payload.filter(p => p.value !== null && p.value !== 0);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "rounded-lg border bg-background/95 backdrop-blur-sm p-2 shadow-md chart-tooltip",
                  "z-50"
                )}
                style={{ maxWidth: isMobile ? '150px' : '240px' }}
              >
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>{label}</p>
                <div className="space-y-1 mt-1">
                  {validData.map((entry) => (
                    <div 
                      key={entry.name}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-1" 
                          style={{ backgroundColor: entry.color }} 
                        />
                        <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium truncate max-w-[70px]`}>
                          {entry.name}:
                        </span>
                      </div>
                      <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold`}>
                        {formatCurrency(Number(entry.value))}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          }}
        />
        <Legend
          content={(props) => {
            const { payload } = props;
            if (!payload || !payload.length) return null;
            
            // Only show legends for categories that have values
            const activeLegends = payload.filter(p => 
              activeCategories.includes(p.value)
            );
            
            // Limit display on mobile
            const displayItems = isMobile ? 4 : 5;
            const displayedItems = activeLegends.slice(0, displayItems);
            const hasMore = activeLegends.length > displayItems;
            
            return (
              <div className="flex flex-wrap justify-center items-center gap-1.5 pt-1 px-1 mt-2">
                {displayedItems.map((entry: any, index: number) => (
                  <div 
                    key={`legend-${index}`}
                    className="flex items-center bg-background/40 rounded-full px-1.5 py-0.5 border border-border/30 shadow-sm"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium whitespace-nowrap`}>
                      {entry.value}
                    </span>
                  </div>
                ))}
                {hasMore && (
                  <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground font-medium`}>
                    +{activeLegends.length - displayItems} more
                  </div>
                )}
              </div>
            );
          }}
        />
        {activeCategories.map((category) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            name={category}
            stroke={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
            strokeWidth={isMobile ? 1.5 : 2}
            dot={{ 
              fill: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
              r: isMobile ? 2 : 4,
              strokeWidth: 1,
              stroke: 'var(--background)'
            }}
            activeDot={{ 
              r: isMobile ? 4 : 6,
              stroke: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
              strokeWidth: 1.5,
              fill: 'var(--background)'
            }}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
