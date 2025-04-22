
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CATEGORY_COLORS, calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { Expense } from "@/components/expenses/types";

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const data = calculatePieChartData(expenses);
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Main percentage (largest category), label, color
  const main = data[0];

  // Responsive sizes
  const outerRadius = isMobile ? 95 : 120;
  const innerRadius = isMobile ? 58 : 76;
  const cardHeight = 300; // px

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center"
      style={{ minHeight: cardHeight, maxHeight: cardHeight, height: cardHeight }}
    >
      {/* Main % in center */}
      <div className="absolute top-1/2 left-1/2 z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
        <span
          className="font-extrabold"
          style={{
            fontSize: isMobile ? 32 : 44,
            letterSpacing: "-1.5px",
            color: main?.color || "#aaa",
            textShadow: "0 2px 8px rgba(150,150,150,0.08)",
            lineHeight: 1,
          }}
        >
          {main ? `${Math.round(main.percent)}%` : "--"}
        </span>
        <span
          className="font-semibold mt-1 text-xs md:text-sm text-muted-foreground"
          style={{ maxWidth: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {main?.name || "No data"}
        </span>
      </div>
      <ResponsiveContainer width="99%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%" cy="50%"
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            startAngle={90}
            endAngle={450}
            paddingAngle={2}
            labelLine={false}
            label={false}
            isAnimationActive={true}
            cornerRadius={14}
          >
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const d = payload[0].payload;
              return (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border bg-background/95 px-3 py-2 shadow-sm text-xs min-w-[120px]"
                  style={{ pointerEvents: "none" }}
                >
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

      {/* Category legend: pastel, horizontal, below chart, no scrollbars */}
      <div className="w-full flex flex-wrap justify-center gap-2 mt-2">
        {data.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 text-xs md:text-sm px-2 py-0.5 rounded-full"
            style={{
              background: entry.color + "22",
              color: "#2a2a2a",
              fontWeight: 500,
              minWidth: 0,
              maxWidth: isMobile ? 96 : 130,
              overflow: "hidden",
              boxShadow: "0 1px 6px 0 rgba(150,150,150,0.04)",
            }}
          >
            <span className="block w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
            <span className="truncate" title={entry.name}>
              {entry.name.length > 14 ? entry.name.slice(0, 13) + "…" : entry.name}
            </span>
            <span className="ml-0.5">{entry.percent.toFixed(0)}%</span>
          </div>
        ))}
      </div>

      {/* Subtle, pastel total below */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
        Total: {formatCurrency(totalAmount, currencyCode)}
      </div>
    </div>
  );
}

