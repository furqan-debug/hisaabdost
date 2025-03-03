
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";
import { calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpensePieChartProps {
  expenses: Expense[];
}

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const pieChartData = calculatePieChartData(expenses);
  const isMobile = useIsMobile();

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
      <PieChart margin={isMobile ? { top: 0, right: 0, left: 0, bottom: 0 } : { top: 0, right: 0, left: 0, bottom: 0 }}>
        <Pie
          data={pieChartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 100 : 150}
          innerRadius={isMobile ? 50 : 75}
          paddingAngle={2}
          label={false}
        >
          {pieChartData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="text-sm font-semibold" style={{ color: data.payload.color }}>
                  {data.name}: {formatCurrency(Number(data.value))}
                </p>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign={isMobile ? "bottom" : "middle"}
          align={isMobile ? "center" : "right"}
          layout={isMobile ? "horizontal" : "vertical"}
          wrapperStyle={isMobile ? { fontSize: '10px', paddingTop: '10px' } : undefined}
          formatter={(value, entry) => {
            const { payload } = entry as any;
            return `${value}: ${formatCurrency(Number(payload.value))}`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
