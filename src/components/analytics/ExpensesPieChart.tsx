import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
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
export function ExpensesPieChart({
  expenses
}: ExpensesPieChartProps) {
  const isMobile = useIsMobile();
  const data = Object.entries(expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#94A3B8',
    percent: 0
  }));
  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach(item => {
    item.percent = total > 0 ? item.value / total * 100 : 0;
  });
  const mainPercentage = data.length > 0 ? Math.round(data[0].percent) : 0;
  return <div className="relative w-full flex flex-col items-center pb-6 mx--3 px-[16px]">
      {/* Chart */}
      <div className="relative w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={isMobile ? 60 : 80} outerRadius={isMobile ? 85 : 110} paddingAngle={0} startAngle={90} endAngle={-270} strokeWidth={0} labelLine={false} label={false}>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
            </Pie>
            <Tooltip animationDuration={200} content={({
            active,
            payload
          }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur-sm">
                    <p className="text-sm font-semibold" style={{
                color: data.payload.color
              }}>
                      {data.name}
                    </p>
                    <p className="text-sm font-bold">{formatCurrency(Number(data.value))}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.payload.percent.toFixed(1)}% of total
                    </p>
                  </motion.div>;
          }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center content inside the donut */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-semibold text-white">{mainPercentage}%</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {data.length > 0 ? data[0].name : "No data"}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="expense-chart-legend mt-6 w-full flex flex-wrap justify-center gap-1.5">
        {data.slice(0, isMobile ? 5 : 6).map((entry, index) => <div key={index} className="expense-chart-legend-item">
            <div className="expense-chart-legend-dot" style={{
          backgroundColor: entry.color
        }} />
            <span className="truncate max-w-[90px]">{entry.name}</span>
            <span className="font-medium ml-1">{entry.percent.toFixed(0)}%</span>
          </div>)}
      </div>
    </div>;
}