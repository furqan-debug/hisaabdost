import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CATEGORY_COLORS, calculatePieChartData } from "@/utils/chartUtils";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

interface ExpensePieChartProps {
  expenses: Expense[];
  hideCenter?: boolean;
  height?: number | string;
  minifiedMode?: boolean;
}

export const ExpensePieChart = ({
  expenses,
  hideCenter = false,
  height = "250px",
  minifiedMode = false
}: ExpensePieChartProps) => {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const data = calculatePieChartData(expenses);

  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const innerRadius = minifiedMode ? (isMobile ? 25 : 35) : (isMobile ? 60 : 80);
  const outerRadius = minifiedMode ? (isMobile ? 45 : 55) : (isMobile ? 80 : 110);

  return (
    <div
      className={`relative w-full h-[${typeof height === 'number' ? `${height}px` : height}] chart-wrapper ${minifiedMode ? 'my-0' : 'my-[-20px]'}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            strokeWidth={0}
            paddingAngle={2}
            labelLine={false}
            label={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || CATEGORY_COLORS[entry.name] || "#ccc"}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0].payload;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="tooltip-card bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-md"
                >
                  <div className="text-sm font-medium">{data.name}</div>
                  <div className="text-sm">{formatCurrency(data.value, currencyCode)}</div>
                </motion.div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
