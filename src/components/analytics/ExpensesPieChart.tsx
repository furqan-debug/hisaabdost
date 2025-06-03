
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
      percent: 0
    }));

  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach(item => {
    item.percent = total > 0 ? (item.value / total) * 100 : 0;
  });

  const mainPercentage = data.length > 0 ? Math.round(data[0].percent) : 0;
  const mainCategory = data.length > 0 ? data[0].name : "No data";

  return (
    <div className="relative w-full flex flex-col items-center pb-6 px-4">
      {/* Chart Container */}
      <div className="relative w-full h-[280px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 70 : 85}
              outerRadius={isMobile ? 95 : 120}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
              labelLine={false}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="transparent"
                  className="transition-all duration-300 hover:opacity-80"
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
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: data.payload.color }}
                      />
                      <p className="text-sm font-semibold text-foreground">
                        {data.name}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(Number(data.value))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.payload.percent.toFixed(1)}% of total spending
                    </p>
                  </motion.div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="bg-background/80 backdrop-blur-sm rounded-full p-4 shadow-sm border"
          >
            <div className="text-3xl font-bold text-primary">{mainPercentage}%</div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">
              {mainCategory}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Top Category
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-8 w-full"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
          {data.slice(0, isMobile ? 4 : 6).map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground truncate block">
                  {entry.name}
                </span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-muted-foreground">
                    {entry.percent.toFixed(0)}%
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Display */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="mt-6 text-center p-3 rounded-lg bg-primary/5 border border-primary/10"
        >
          <div className="text-sm text-muted-foreground">Total Expenses</div>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(total)}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
