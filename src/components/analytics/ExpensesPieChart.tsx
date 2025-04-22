
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CATEGORY_COLORS, formatCurrency, calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  receiptUrl?: string;
}

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const isMobile = useIsMobile();

  // Improved: limit to top 5 categories, then group the rest as "Other"
  let data = calculatePieChartData(expenses);
  const topCategories = data.slice(0, 5);
  const other = data.slice(5).reduce((acc, curr) => ({
    ...acc,
    value: acc.value + curr.value,
    percent: acc.percent + curr.percent,
  }), { name: 'Other', value: 0, percent: 0, color: CATEGORY_COLORS["Other"] });

  const displayData = other.value > 0 ? [...topCategories, { ...other }] : topCategories;
  const total = displayData.reduce((sum, item) => sum + item.value, 0);

  // Get main category percent, rounded
  const mainPercentage = displayData.length > 0 ? Math.round((displayData[0].percent)) : 0;
  const mainLabel = displayData.length > 0 ? displayData[0].name : "";

  return (
    <div className="relative w-full flex flex-col items-center h-[220px] md:h-[300px]">
      {/* Center bold percentage and label */}
      <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="block text-3xl md:text-4xl font-black tracking-tight" style={{ color: displayData[0]?.color }}>
          {mainPercentage}%
        </span>
        <span className="block text-muted-foreground text-xs md:text-sm font-medium">{mainLabel}</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 80 : 120}
            innerRadius={isMobile ? 55 : 80}
            paddingAngle={3}
            startAngle={90}
            endAngle={-270}
            cornerRadius={10}
            labelLine={false}
            label={({ name, percent }) =>
              percent > 0
                ? (
                  <span className="font-semibold text-xs md:text-base" style={{ color: CATEGORY_COLORS[name] || "#999" }}>
                    {Math.round(percent)}%
                  </span>
                )
                : ''
            }
            isAnimationActive={true}
            animationDuration={500}
          >
            {displayData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload[0]) return null;
              const entry = payload[0].payload;
              return (
                <motion.div className="rounded-xl border bg-background px-3 py-2 shadow-sm text-foreground text-xs font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span style={{ color: entry.color }}>{entry.name}</span>:<br />
                  {formatCurrency(entry.value)}<br />
                  <span className="text-muted-foreground">
                    {entry.percent.toFixed(1)}% of total
                  </span>
                </motion.div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Minimal Legend */}
      <div className="w-full mt-2 flex flex-wrap justify-center gap-3">
        {displayData.map((entry, idx) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="w-3 h-3 rounded-full border" style={{ background: entry.color, borderColor: "#eee" }}/>
            {entry.name.length > 10 ? entry.name.slice(0,10)+"…" : entry.name}
          </div>
        ))}
      </div>
    </div>
  );
}
