
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CATEGORY_COLORS, calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
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
  const { currencyCode } = useCurrency();
  const data = calculatePieChartData(expenses);
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  // For modern big percent in center, get biggest category percent
  const mainPercentage = data.length > 0 ? Math.round(data[0].percent) : 0;
  const mainLabel = data.length > 0 ? data[0].name : "";
  return (
    <div className="relative w-full h-[300px] md:h-[330px] flex flex-col justify-center items-center px-2">
      {/* Center modern total */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
        <span className="text-4xl md:text-5xl font-extrabold" style={{letterSpacing: '-1px'}}>{mainPercentage}%</span>
        <div className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          {mainLabel ? `${mainLabel}` : "No data"}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{top: 0, right: 0, bottom: 0, left: 0}}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%" cy="50%"
            outerRadius={isMobile ? 100 : 123}
            innerRadius={isMobile ? 66 : 92}
            paddingAngle={2}
            cornerRadius={18}
            labelLine={false}
            label={false}
            isAnimationActive={true}
          >
            {data.map((entry, index) =>
              <Cell key={index} fill={entry.color} stroke="transparent" />
            )}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const d = payload[0].payload;
              return (
                <motion.div initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}}
                  className="rounded-xl border bg-background/95 px-3 py-2 shadow-sm text-xs min-w-[120px]">
                  <div className="flex items-center gap-2 pb-1">
                    <span className="w-[15px] h-[15px] rounded-full" style={{ background: d.color }}></span>
                    <span className="font-bold">{d.name}</span>
                  </div>
                  <div className="mb-0.5">{formatCurrency(Number(d.value), currencyCode)}</div>
                  <div className="text-muted-foreground">{d.percent.toFixed(1)}% of total</div>
                </motion.div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Modern, soft pastel legend: row, below chart */}
      <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 justify-center mt-2 w-full">
        {data.slice(0, isMobile ? 4 : 7).map((entry, index) => (
          <div key={index}
            className="flex items-center gap-1.5 font-medium text-xs md:text-sm px-2 py-0.5 rounded-full"
            style={{background: entry.color + '22'}}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="truncate max-w-[60px]">{entry.name.length > 10 ? entry.name.slice(0, 10) + "…" : entry.name}</span>
            <span className="ml-1 text-xs font-semibold">{entry.percent.toFixed(0)}%</span>
          </div>
        ))}
      </div>
      {/* Actual total, softly at the bottom */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
        Total: {formatCurrency(totalAmount, currencyCode)}
      </div>
    </div>
  );
}
