
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
  )
  .sort(([, a], [, b]) => b - a)
  .map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#94A3B8',
    percent: 0 // This will be calculated below
  }));
  
  // Calculate percentages based on total
  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach(item => {
    item.percent = total > 0 ? (item.value / total) : 0;
  });
  
  // Get main percentage (for the largest category)
  const mainPercentage = data.length > 0 
    ? Math.round(data[0].percent * 100) 
    : 0;
  
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Display the center percentage */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
        <span className="text-4xl font-bold">{mainPercentage}%</span>
      </div>
      
      <ResponsiveContainer width="100%" height={isMobile ? 300 : "100%"}>
        <PieChart margin={isMobile ? { top: 0, right: 0, left: 0, bottom: 0 } : { top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 110 : 130}
            innerRadius={isMobile ? 75 : 90}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            cornerRadius={4}
            labelLine={false}
            label={false} // Remove labels for cleaner appearance
            isAnimationActive={true}
            animationDuration={800}
            animationBegin={0}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="transparent" 
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
        </PieChart>
      </ResponsiveContainer>
      
      {/* Simple legend below the chart */}
      <div className="flex flex-wrap justify-center mt-2 gap-3">
        {data.slice(0, 5).map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5 text-sm">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium">
              {entry.name.length > 10 ? entry.name.slice(0, 10) + "..." : entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
