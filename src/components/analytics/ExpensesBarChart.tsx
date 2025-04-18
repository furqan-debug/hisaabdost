
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { format, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface Expense {
  amount: number;
  category: string;
  date: string;
}

interface ExpensesBarChartProps {
  expenses: Expense[];
}

export function ExpensesBarChart({ expenses }: ExpensesBarChartProps) {
  const isMobile = useIsMobile();

  const data = expenses.reduce((acc, expense) => {
    const month = format(parseISO(expense.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = {};
    }
    acc[month][expense.category] = (acc[month][expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const chartData = Object.entries(data).map(([month, categories]) => ({
    month,
    ...categories
  }));

  // Get active categories (ones that have values)
  const activeCategories = Object.keys(CATEGORY_COLORS).filter(category => 
    chartData.some(item => item[category] !== undefined && item[category] > 0)
  );

  // Chart height and bar size based on device
  const chartHeight = isMobile ? 280 : 400;
  const barSize = isMobile ? 6 : 14;

  return (
    <ResponsiveContainer width="100%" height={chartHeight} className="bar-chart-container">
      <BarChart 
        data={chartData}
        margin={isMobile ? { top: 5, right: 0, left: -20, bottom: 0 } : { top: 20, right: 15, left: 0, bottom: 5 }}
        barCategoryGap={isMobile ? "20%" : "30%"}
        barGap={isMobile ? 1 : 4}
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
          tick={{ fontSize: isMobile ? 8 : 12, fill: 'var(--muted-foreground)' }}
          dy={8}
          height={isMobile ? 15 : 30}
        />
        <YAxis 
          tickFormatter={(value) => `$${(Number(value)/1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 8 : 12, fill: 'var(--muted-foreground)' }}
          width={isMobile ? 25 : 45}
        />
        <Tooltip
          cursor={{ fillOpacity: 0.05 }}
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            
            // Filter out categories with no expenses (value === 0 or undefined)
            const validData = payload.filter(p => p.value && Number(p.value) > 0);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border bg-background/95 backdrop-blur-sm p-2 shadow-md"
                style={{ maxWidth: isMobile ? '160px' : '240px' }}
              >
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>{label}</p>
                <div className="space-y-1 mt-1">
                  {validData.map((entry) => (
                    <div 
                      key={entry.name}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-1" 
                          style={{ backgroundColor: entry.color }} 
                        />
                        <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium`}>
                          {entry.name}:
                        </span>
                      </div>
                      <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-semibold`}>
                        {formatCurrency(Number(entry.value))}
                      </span>
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
            const displayItems = isMobile ? 3 : 5;
            const displayedItems = activeLegends.slice(0, displayItems);
            const hasMore = activeLegends.length > displayItems;
            
            return (
              <div className="flex flex-wrap justify-center items-center gap-1.5 pt-1 px-1">
                {displayedItems.map((entry: any, index: number) => (
                  <div 
                    key={`legend-${index}`}
                    className="flex items-center bg-background/40 rounded-full px-1.5 py-0.5 border border-border/30 shadow-sm"
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium whitespace-nowrap`}>
                      {entry.value}
                    </span>
                  </div>
                ))}
                {hasMore && (
                  <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground font-medium`}>
                    +{activeLegends.length - displayItems} more
                  </div>
                )}
              </div>
            );
          }}
        />
        {activeCategories.map((category) => (
          <Bar
            key={category}
            dataKey={category}
            fillOpacity={0.85}
            barSize={barSize}
            radius={[2, 2, 0, 0]}
            fill={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
            className="hover:brightness-105 transition-all duration-300"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
