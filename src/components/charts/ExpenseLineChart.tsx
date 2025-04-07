
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

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

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 320 : 400}>
      <LineChart 
        data={chartData}
        margin={isMobile ? { top: 10, right: 5, left: -15, bottom: 0 } : { top: 20, right: 15, left: 0, bottom: 5 }}
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
          tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--muted-foreground)' }}
          dy={10}
        />
        <YAxis 
          tickFormatter={(value) => `$${Number(value)/1000}k`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--muted-foreground)' }}
          width={isMobile ? 35 : 45}
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
                className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-md"
              >
                <p className="text-sm font-semibold">{label}</p>
                <div className="space-y-1.5 mt-1.5">
                  {validData.map((entry) => (
                    <div 
                      key={entry.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-2.5 h-2.5 rounded-full mr-1.5" 
                          style={{ backgroundColor: entry.color }} 
                        />
                        <span className="text-xs font-medium">{entry.name}:</span>
                      </div>
                      <span className="text-xs font-semibold">{formatCurrency(Number(entry.value))}</span>
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
            const displayedItems = isMobile ? activeLegends.slice(0, 5) : activeLegends;
            const hasMore = isMobile && activeLegends.length > 5;
            
            return (
              <div className="flex flex-wrap justify-center items-center gap-2 pt-4 px-2">
                {displayedItems.map((entry: any, index: number) => (
                  <div 
                    key={`legend-${index}`}
                    className="flex items-center bg-background/40 rounded-full px-2.5 py-1 border border-border/30 shadow-sm"
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full mr-1.5" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className="text-xs font-medium whitespace-nowrap">
                      {entry.value}
                    </span>
                  </div>
                ))}
                {hasMore && (
                  <div className="text-xs text-muted-foreground font-medium">
                    +{activeLegends.length - 5} more
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
            strokeWidth={2}
            dot={{ 
              fill: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
              r: isMobile ? 3 : 4,
              strokeWidth: 1,
              stroke: 'var(--background)'
            }}
            activeDot={{ 
              r: isMobile ? 5 : 6,
              stroke: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
              strokeWidth: 2,
              fill: 'var(--background)'
            }}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
