
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CATEGORY_COLORS, calculatePieChartData } from "@/utils/chartUtils";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

interface ExpensePieChartProps {
  expenses: Expense[];
}

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const data = calculatePieChartData(expenses);
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  
  return (
    <div className="w-full h-[300px] flex flex-col items-center relative overflow-visible">
      <div className="chart-center-total">
        <div className="chart-center-total-amount">
          {formatCurrency(totalAmount, currencyCode)}
        </div>
        <div className="chart-center-total-label">
          Total Expenses
        </div>
      </div>
      
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 50 : 75}
              outerRadius={isMobile ? 70 : 100}
              paddingAngle={2}
              cornerRadius={4}
              labelLine={false}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="transparent"
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
                    className="tooltip-card"
                  >
                    <div className="text-sm font-medium mb-1">{data.name}</div>
                    <div className="text-sm">{formatCurrency(data.value, currencyCode)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {data.percent.toFixed(1)}% of total
                    </div>
                  </motion.div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="expense-chart-legend">
        {data.slice(0, isMobile ? 3 : 5).map((entry, index) => (
          <div key={index} className="expense-chart-legend-item">
            <div 
              className="expense-chart-legend-dot"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}</span>
            <span className="font-medium ml-1">
              {entry.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
