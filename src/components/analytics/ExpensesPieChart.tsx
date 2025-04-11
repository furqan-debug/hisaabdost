
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
  
  // Calculate percentages based on total
  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach(item => {
    item.percent = total > 0 ? (item.value / total) : 0;
  });
  
  // Animation for pie chart segments
  const ANIMATION_DURATION = 800;
  
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 320 : "100%"}>
      <PieChart margin={isMobile ? { top: 25, right: 10, left: 10, bottom: 35 } : { top: 20, right: 40, left: 40, bottom: 40 }}>
        <defs>
          {data.map((entry, index) => (
            <linearGradient key={`colorGradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
              <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 80 : 150}
          innerRadius={isMobile ? 40 : 75}
          paddingAngle={3}
          isAnimationActive={true}
          animationDuration={ANIMATION_DURATION}
          animationBegin={0}
          animationEasing="ease-out"
          labelLine={false}
          label={({ name, percent }) => {
            // Only show percentage for segments > 5%
            if (percent < 0.05) return null;
            return `${(percent * 100).toFixed(0)}%`;
          }}
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#colorGradient-${index})`} 
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
          verticalAlign="bottom"
          align="center"
          layout="horizontal"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            fontSize: isMobile ? '11px' : '13px',
            paddingTop: '10px', 
            width: '100%',
            bottom: isMobile ? 0 : 10
          }}
          formatter={(value, entry: any) => {
            // Extract just the category name to avoid overlapping
            const displayName = value.length > 10 ? `${value.slice(0, 10)}...` : value;
            const amount = formatCurrency(entry.payload.value);
            
            return (
              <span style={{ 
                color: 'var(--foreground)', 
                marginLeft: '4px',
                marginRight: isMobile ? '8px' : '12px',
                display: 'inline-block'
              }}>
                {displayName}: {amount}
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
