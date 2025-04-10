
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { Expense } from "@/components/expenses/types";
import { calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpensePieChartProps {
  expenses: Expense[];
}

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const pieChartData = calculatePieChartData(expenses);
  const isMobile = useIsMobile();
  
  // Sort data by value in descending order for better visualization
  pieChartData.sort((a, b) => b.value - a.value);
  
  // Calculate percentages
  const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
  pieChartData.forEach(item => {
    item.percent = total > 0 ? (item.value / total) : 0;
  });

  // Adjust chart dimensions based on mobile or desktop
  const outerRadius = isMobile ? 85 : 150;
  const innerRadius = isMobile ? 40 : 90;

  return (
    <div className="pie-wrapper w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={290} className="pie-chart-container">
        <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 15 }}>
          <Pie
            data={pieChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            paddingAngle={3}
            strokeWidth={0}
            labelLine={false}
            label={({ percent }) => {
              // Only show percentage for segments > 5%
              if (percent < 0.05) return null;
              const percentLabel = (percent * 100).toFixed(0) + '%';
              return (
                <text 
                  x={0} 
                  y={0}
                  fill="var(--foreground)"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium"
                  style={{ fontSize: isMobile ? '9px' : '12px' }}
                >
                  {percentLabel}
                </text>
              );
            }}
          >
            {pieChartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="var(--background)" 
                strokeWidth={2}
                className="filter drop-shadow-sm hover:brightness-105 transition-all duration-300"
              />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0];
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-lg border bg-background/95 backdrop-blur-sm p-2 shadow-md chart-tooltip",
                    "z-50"
                  )}
                  style={{ maxWidth: isMobile ? '160px' : '180px' }}
                >
                  <p className="text-sm font-semibold" style={{ color: data.payload.color }}>
                    {data.name}
                  </p>
                  <p className="text-sm font-bold">
                    {formatCurrency(Number(data.value))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(data.payload.percent * 100).toFixed(1)}% of total
                  </p>
                </motion.div>
              );
            }}
          />
          <Legend
            content={(props) => {
              const { payload } = props;
              
              if (!payload || !payload.length) return null;
              
              // Limit to top categories on mobile to prevent overcrowding
              const displayItems = isMobile ? 3 : 6;
              const displayedItems = payload.slice(0, displayItems);
              const hasMore = payload.length > displayItems;
              
              return (
                <div className="flex flex-wrap justify-center items-center gap-1.5 pt-1 px-1 mt-2">
                  {displayedItems.map((entry: any, index: number) => {
                    const amount = formatCurrency(entry.payload.value);
                    const name = entry.value;
                    // Truncate long category names even more on mobile
                    const displayName = name.length > (isMobile ? 8 : 12) ? 
                      name.slice(0, isMobile ? 6 : 10) + '...' : name;
                    
                    return (
                      <div 
                        key={`legend-${index}`}
                        className="flex items-center bg-background/40 rounded-full px-2 py-0.5 border border-border/30 shadow-sm"
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-1" 
                          style={{ backgroundColor: entry.color }} 
                        />
                        <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium whitespace-nowrap`}>
                          {displayName}: {amount}
                        </span>
                      </div>
                    );
                  })}
                  {hasMore && (
                    <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground font-medium`}>
                      +{payload.length - displayItems} more
                    </div>
                  )}
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
