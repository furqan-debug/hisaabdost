
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface Expense {
  amount: number;
  category: string;
}

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const isMobile = useIsMobile();
  
  const data = Object.entries(
    expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#A4DE6C',
    percent: 0 // This will be calculated below
  }));
  
  // Sort data by value in descending order for better visualization
  data.sort((a, b) => b.value - a.value);
  
  // Calculate percentages based on total
  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach(item => {
    item.percent = total > 0 ? (item.value / total) : 0;
  });
  
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 360 : 400}>
      <PieChart margin={isMobile ? { top: 20, right: 10, left: 10, bottom: 50 } : { top: 20, right: 30, left: 30, bottom: 50 }}>
        <Pie
          data={data}
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
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              stroke="var(--background)" 
              strokeWidth={2} 
            />
          ))}
        </Pie>
        <Tooltip
          animationDuration={200}
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border bg-background p-3 shadow-md"
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
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: isMobile ? '11px' : '13px',
            width: '100%',
            maxWidth: '100%',
            paddingBottom: '10px',
            position: 'relative',
            bottom: isMobile ? -10 : 0
          }}
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
