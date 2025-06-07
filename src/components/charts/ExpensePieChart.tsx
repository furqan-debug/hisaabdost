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
  const {
    currencyCode
  } = useCurrency();
  const data = calculatePieChartData(expenses);

  // Calculate total amount
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Adjust sizes for minified mode (used in chat visualizations)
  const innerRadius = minifiedMode ? isMobile ? 25 : 35 : isMobile ? 60 : 80;
  const outerRadius = minifiedMode ? isMobile ? 45 : 55 : isMobile ? 80 : 110;
  return <div className={`relative w-full h-[${typeof height === 'number' ? `${height}px` : height}] chart-wrapper ${minifiedMode ? 'my-0' : 'my-[-20px]'}`}>
      {/* Center total display */}
      {!hideCenter && <div className="chart-center-total">
          <div className="chart-center-total-amount text-foreground">
            {formatCurrency(totalAmount, currencyCode)}
          </div>
          <div className="chart-center-total-label text-muted-foreground">
            Total Expenses
          </div>
        </div>}
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }}>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={0} cornerRadius={0} strokeWidth={0} labelLine={false} label={false}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
          </Pie>
          <Tooltip content={({
          active,
          payload
        }) => {
          if (!active || !payload || !payload.length) return null;
          const data = payload[0].payload;
          return <motion.div initial={{
            opacity: 0,
            y: 5
          }} animate={{
            opacity: 1,
            y: 0
          }} className="tooltip-card bg-popover text-popover-foreground">
                  <div className="text-sm font-medium mb-1">{data.name}</div>
                  <div className="text-sm py-1">
                    {formatCurrency(data.value, currencyCode)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {data.percent.toFixed(1)}% of total
                  </div>
                </motion.div>;
        }} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Simplified mobile-friendly legend */}
      {!minifiedMode && <div className="expense-chart-legend my-[-26px]">
          {data.slice(0, isMobile ? 4 : 6).map((entry, index) => <div key={index} className="expense-chart-legend-item bg-muted/20 text-foreground">
              <div className="expense-chart-legend-dot" style={{
          backgroundColor: entry.color
        }} />
              <span>{entry.name}</span>
              <span className="font-medium ml-1">
                {entry.percent.toFixed(0)}%
              </span>
            </div>)}
        </div>}
    </div>;
};