
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
  }));

  // Animation for pie chart segments
  const ANIMATION_DURATION = 800;
  
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 300 : "100%"}>
      <PieChart margin={isMobile ? { top: 5, right: 5, left: 5, bottom: 5 } : { top: 10, right: 30, left: 30, bottom: 30 }}>
        <defs>
          {data.map((entry, index) => (
            <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
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
          label={({ name, percent }) => isMobile ? 
            (percent > 0.1 ? `${(percent * 100).toFixed(0)}%` : '') : 
            (percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : '')
          }
          labelLine={!isMobile}
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
                className="rounded-lg border bg-background p-2 shadow-md"
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
          verticalAlign={isMobile ? "bottom" : "middle"}
          align={isMobile ? "center" : "right"}
          layout={isMobile ? "horizontal" : "vertical"}
          iconType="circle"
          iconSize={8}
          wrapperStyle={isMobile ? { fontSize: '10px', paddingTop: '5px', maxWidth: '100%', overflow: 'hidden' } : { fontSize: '13px' }}
          formatter={(value, entry: any) => {
            return (
              <span style={{ color: 'var(--foreground)', marginLeft: '5px', fontSize: isMobile ? '10px' : '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isMobile ? '60px' : 'auto', display: 'inline-block' }}>
                {value}: {formatCurrency(entry.payload.value)}
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
