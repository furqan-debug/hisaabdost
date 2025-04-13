
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS, calculatePieChartData } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface ExpensePieChartProps {
  expenses: Expense[];
}

// Define the type for pie chart data items
interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
  percent: number;
}

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const pieChartData = calculatePieChartData(expenses) as PieChartDataItem[];
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  // Sort data by value in descending order for better visualization
  pieChartData.sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 320 : 400}>
      <PieChart margin={isMobile ? { top: 20, right: 10, left: 10, bottom: 35 } : { top: 10, right: 30, left: 30, bottom: 30 }}>
        <Pie
          data={pieChartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 90 : 140}
          innerRadius={isMobile ? 45 : 70}
          paddingAngle={3}
          labelLine={false}
          label={({ percent }) => {
            // Only show percentage for segments > 5%
            if (percent < 0.05) return null;
            return `${(percent * 100).toFixed(0)}%`;
          }}
        >
          {pieChartData.map((entry) => (
            <Cell 
              key={entry.name} 
              fill={entry.color} 
              stroke="var(--background)" 
              strokeWidth={2} 
            />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return (
              <div className="rounded-lg border bg-background p-3 shadow-md">
                <p className="text-sm font-semibold" style={{ color: data.payload.color }}>
                  {data.name}
                </p>
                <p className="text-sm font-bold">
                  {formatCurrency(Number(data.value), currencyCode)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(data.payload.percent * 100).toFixed(1)}% of total
                </p>
              </div>
            );
          }}
        />
        <Legend
          verticalAlign="bottom"
          align="center"
          layout="horizontal"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ 
            fontSize: isMobile ? '11px' : '13px',
            paddingTop: '10px',
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px'
          }}
          formatter={(value, entry: any) => {
            // Extract just the category name to avoid overlapping
            const displayName = value.length > 10 ? `${value.slice(0, 10)}...` : value;
            const amount = formatCurrency(entry.payload.value, currencyCode);
            
            return (
              <span style={{ 
                color: 'var(--foreground)', 
                display: 'inline-block',
                padding: '2px 4px',
                whiteSpace: 'nowrap'
              }}>
                {displayName}: {amount}
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
