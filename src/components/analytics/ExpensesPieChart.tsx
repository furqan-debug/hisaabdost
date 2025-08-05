
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";
import { motion } from "framer-motion";
import { useAllCategories } from "@/hooks/useAllCategories";

interface Expense {
  amount: number;
  category: string;
}

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const { categories } = useAllCategories();

  // Create category colors map from all categories
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.value] = cat.color;
    return acc;
  }, {} as Record<string, string>);

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
      color: categoryColors[name] || '#94A3B8',
      percent: 0
    }));

  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach(item => {
    item.percent = total > 0 ? (item.value / total) * 100 : 0;
  });

  const mainPercentage = data.length > 0 ? Math.round(data[0].percent) : 0;
  const mainCategory = data.length > 0 ? data[0].name : "No data";

  return (
    <div className="w-full space-y-6">
      {/* Chart and Legend Container */}
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-6'}`}>
        {/* Chart Container - Smaller and centered */}
        <div className={`relative ${isMobile ? 'w-full h-48' : 'w-64 h-64'} flex-shrink-0`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 45 : 60}
                outerRadius={isMobile ? 70 : 90}
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
                        {formatCurrency(Number(data.value), currencyCode)}
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
        </div>

        {/* Category Legend - Positioned beside chart on desktop, below on mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className={`flex-1 ${isMobile ? 'w-full' : 'max-w-xs'}`}
        >
          <div className="space-y-3">
            {data.slice(0, 5).map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className={`flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200 ${
                  index === 0 ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm text-foreground truncate ${
                      index === 0 ? 'font-bold' : 'font-medium'
                    }`}>
                      {entry.name}
                    </span>
                    {index === 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
                        Top
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">
                      {entry.percent.toFixed(0)}%
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(entry.value, currencyCode)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Total Expenses - Single instance */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
      >
        <div className="text-sm text-muted-foreground mb-1">Total Expenses</div>
        <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent`}>
          {formatCurrency(total, currencyCode)}
        </div>
      </motion.div>
    </div>
  );
}
