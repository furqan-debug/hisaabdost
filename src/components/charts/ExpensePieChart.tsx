
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";
import { calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

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

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 360 : 400}>
      <PieChart margin={isMobile ? { top: 20, right: 10, left: 10, bottom: 50 } : { top: 20, right: 30, left: 30, bottom: 50 }}>
        <Pie
          data={pieChartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={isMobile ? 90 : 140}
          innerRadius={isMobile ? 45 : 70}
          paddingAngle={2}
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
                className="font-medium text-xs"
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
            />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return (
              <div className="rounded-lg border bg-background p-3 shadow-md">
                <p className="text-sm font-semibold" style={{ color: data.payload.color }}>
                  {data.name}
                </p>
                <p className="text-sm font-bold">
                  {formatCurrency(Number(data.value))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(data.payload.percent * 100).toFixed(1)}% of total
                </p>
              </div>
            );
          }}
        />
        <Legend
          content={(props) => {
            const { payload } = props;
            
            if (!payload || !payload.length) return null;
            
            // Limit to top 5 items on mobile to prevent overcrowding
            const displayedItems = isMobile ? payload.slice(0, 5) : payload;
            const hasMore = isMobile && payload.length > 5;
            
            return (
              <div className="flex flex-wrap justify-center items-center gap-2 pt-4 px-2">
                {displayedItems.map((entry: any, index: number) => {
                  const amount = formatCurrency(entry.payload.value);
                  const name = entry.value;
                  // Truncate long category names
                  const displayName = name.length > 12 ? 
                    name.slice(0, 10) + '...' : name;
                  
                  return (
                    <div 
                      key={`legend-${index}`}
                      className="flex items-center bg-background/50 rounded-full px-2 py-0.5 border border-border/40"
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-1.5" 
                        style={{ backgroundColor: entry.color }} 
                      />
                      <span className="text-xs whitespace-nowrap">
                        {displayName}: {amount}
                      </span>
                    </div>
                  );
                })}
                {hasMore && (
                  <div className="text-xs text-muted-foreground">
                    +{payload.length - 5} more
                  </div>
                )}
              </div>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
