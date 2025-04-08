// ✅ Updated ExpenseBarChart.tsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CATEGORY_COLORS, formatCurrency, processMonthlyData } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import "@/styles/mobile-charts.css";

interface ExpenseBarChartProps {
  expenses: Expense[];
}

export const ExpenseBarChart = ({ expenses }: ExpenseBarChartProps) => {
  const chartData = processMonthlyData(expenses);
  const isMobile = useIsMobile();

  const activeCategories = Object.keys(CATEGORY_COLORS).filter((category) =>
    chartData.some((item) => item[category] !== null && item[category] > 0)
  );

  const chartHeight = isMobile ? 280 : 400;
  const barSize = isMobile ? 6 : 14;

  return (
    <ResponsiveContainer width="100%" height={chartHeight} className="bar-chart-container">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        barCategoryGap={isMobile ? "20%" : "30%"}
        barGap={isMobile ? 1 : 4}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal opacity={0.15} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 8 : 12, fill: "var(--muted-foreground)" }}
          dy={8}
        />
        <YAxis
          tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: isMobile ? 8 : 12, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          wrapperStyle={{ zIndex: 10 }}
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            const validData = payload.filter((p) => p.value && Number(p.value) > 0);
            return (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="custom-tooltip"
              >
                <p className="font-semibold text-xs">{label}</p>
                <div className="mt-1 space-y-1">
                  {validData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-medium">{entry.name}:</span>
                      </div>
                      <span className="text-[10px] font-semibold">{formatCurrency(Number(entry.value))}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          }}
        />
        <Legend
          wrapperStyle={{ position: "relative", marginTop: 8 }}
          content={({ payload }) => {
            if (!payload || !payload.length) return null;
            const activeLegends = payload.filter((p) => activeCategories.includes(p.value));
            const displayItems = isMobile ? 3 : 5;
            const displayedItems = activeLegends.slice(0, displayItems);
            const hasMore = activeLegends.length > displayItems;
            return (
              <div className="legend-container">
                {displayedItems.map((entry, index) => (
                  <div
                    key={`legend-${index}`}
                    className="flex items-center bg-background/40 rounded-full px-1.5 py-0.5 border border-border/30 shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] font-medium whitespace-nowrap">{entry.value}</span>
                  </div>
                ))}
                {hasMore && (
                  <div className="text-[10px] text-muted-foreground font-medium">
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
            name={category}
            fill={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
            fillOpacity={0.85}
            barSize={barSize}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};