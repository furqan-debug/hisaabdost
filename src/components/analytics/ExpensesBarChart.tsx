
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { formatCurrency } from "@/utils/formatters";
import { format, parseISO } from "date-fns";
import { useCurrency } from "@/hooks/use-currency";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Expense } from "@/components/expenses/types";

interface ExpensesBarChartProps {
  expenses: Expense[];
}

export function ExpensesBarChart({ expenses }: ExpensesBarChartProps) {
  const { currencyCode } = useCurrency();
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

  // Get top categories by total amount
  const getCategoryTotal = (category: string) => {
    return chartData.reduce((sum, item) => sum + (item[category] || 0), 0);
  };
  
  const allCategories = Object.keys(CATEGORY_COLORS);
  const activeCategories = allCategories.filter(category => 
    chartData.some(item => item[category] && item[category] > 0)
  );
  
  const topCategories = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a))
    .slice(0, isMobile ? 4 : 6);

  return (
    <div className="w-full h-[300px] md:h-[350px] pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={isMobile ? { top: 15, right: 5, left: 0, bottom: 20 } : { top: 20, right: 30, left: 0, bottom: 5 }}
          barCategoryGap={isMobile ? "20%" : "30%"}
          maxBarSize={isMobile ? 28 : 40}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 11 : 13, fill: 'var(--foreground)' }}
            dy={8}
            interval={isMobile ? 1 : 0}
          />
          <YAxis 
            tickFormatter={value => {
              if (isMobile) {
                if (value >= 1000) return `${Math.floor(value / 1000)}k`;
                return value.toString();
              }
              return formatCurrency(value, currencyCode);
            }} 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: isMobile ? 11 : 13, fill: 'var(--foreground)' }}
            width={isMobile ? 30 : 60}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              
              // Filter out zero values and limit to top entries
              const filteredPayload = payload
                .filter(entry => Number(entry.value) > 0)
                .slice(0, isMobile ? 3 : 5);
                
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border bg-background/95 px-3 py-2 shadow-md backdrop-blur-sm"
                >
                  <p className="text-sm font-semibold mb-1">{label}</p>
                  <div className="space-y-1">
                    {filteredPayload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="truncate max-w-[90px]">{entry.name}</span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(Number(entry.value), currencyCode)}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            }}
          />
          
          {/* Only render bars for top categories */}
          {topCategories.map(category => (
            <Bar 
              key={category} 
              dataKey={category} 
              stackId="a" 
              fill={CATEGORY_COLORS[category]} 
              radius={[4, 4, 0, 0]}
              animationDuration={800}
              animationBegin={300}
              isAnimationActive={true}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      {/* Mobile-friendly legend */}
      <div className="chart-legend-row">
        {topCategories.map(category => (
          <div 
            key={category} 
            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: (CATEGORY_COLORS[category] || "#eee") + "22" }}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: CATEGORY_COLORS[category] }} 
            />
            <span className="truncate">
              {category.length > 12 ? category.slice(0, 12) + "…" : category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
