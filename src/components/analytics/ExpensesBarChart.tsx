
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { CATEGORY_COLORS, processMonthlyData } from "@/utils/chartUtils";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
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

// Helper function for short month labels
const shortMonth = (label: string) => {
  if (label.length > 8) return label.slice(0, 7) + "…";
  return label;
};

export function ExpensesBarChart({ expenses }: ExpensesBarChartProps) {
  const { currencyCode } = useCurrency();
  const isMobile = useIsMobile();
  // Horizontal bar chart: y-axis = month (short), x-axis = amount, pastel bars
  const data = processMonthlyData(expenses);

  // Categories with value (top 3-5)
  const activeCategories = Object.keys(CATEGORY_COLORS).filter(category =>
    data.some(item => item[category] > 0)
  );
  const getCategoryTotal = (category: string) =>
    data.reduce((sum, item) => sum + (item[category] || 0), 0);
  const topCategories = activeCategories
    .sort((a, b) => getCategoryTotal(b) - getCategoryTotal(a))
    .slice(0, isMobile ? 3 : 5);
  return (
    <div className="w-full h-[230px] md:h-[300px] py-2 px-1 md:px-2 rounded-2xl bg-[hsl(var(--muted)/0.6)] border border-border/50 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap={isMobile ? "20%" : "35%"}
          margin={{
            top: isMobile ? 14 : 24,
            right: isMobile ? 6 : 20,
            left: isMobile ? 33 : 60,
            bottom: isMobile ? 20 : 20
          }}
        >
          <CartesianGrid strokeDasharray="2 4" horizontal={false} opacity={0.10} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            fontSize={isMobile ? 10 : 13}
            tickFormatter={(value) => formatCurrency(Number(value), currencyCode)}
            stroke="var(--muted-foreground)"
            tick={{fontWeight: 500}}
          />
          <YAxis
            type="category"
            dataKey="month"
            axisLine={false}
            tickLine={false}
            fontSize={isMobile ? 11 : 14}
            width={isMobile ? 50 : 70}
            tickFormatter={shortMonth}
            stroke="var(--muted-foreground)"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              // Only top 3
              const filteredPayload = payload
                .filter(entry => Number(entry.value) > 0)
                .slice(0, isMobile ? 3 : 5);
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border bg-background/95 px-3 py-2 shadow-md text-xs min-w-[110px]"
                >
                  <div className="font-semibold mb-0.5">{label}</div>
                  <div>
                    {filteredPayload.map((item, idx) => (
                      <div className="flex items-center gap-1 mb-0.5" key={item.name}>
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}:</span>
                        <span className="ml-1 font-medium">
                          {formatCurrency(Number(item.value), currencyCode)}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            }}
          />
          {/* Pastel horizontal bars with soft radius */}
          {topCategories.map(category => (
            <Bar
              key={category}
              dataKey={category}
              fill={CATEGORY_COLORS[category]}
              radius={[10, 10, 10, 10]}
              maxBarSize={isMobile ? 20 : 26}
              className="transition-all"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {/* Modern, simple legend above chart */}
      <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
        {topCategories.map(cat => (
          <div key={cat} className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{
            background: (CATEGORY_COLORS[cat] || "#eee") + "22"
          }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
            <span className="truncate">{cat.length > 10 ? cat.slice(0, 10)+"…" : cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
