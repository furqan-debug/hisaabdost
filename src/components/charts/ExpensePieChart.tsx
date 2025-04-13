
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
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
  percent: number; // Added percent property
}

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const pieChartData = calculatePieChartData(expenses) as PieChartDataItem[];
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  // Sort data by value in descending order for better visualization
  pieChartData.sort((a, b) => b.value - a.value);
  
  // Calculate percentages
  const total = pieChartData.reduce((sum, item) => sum + item.value, 0);
  pieChartData.forEach(item => {
    item.percent = total > 0 ? (item.value / total) : 0;
  });

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
          {pieChartData.map((entry, index) => (
            <Cell 
              key={`${entry.name}-${index}`} 
              fill={entry.color} 
              stroke="var(--background)" 
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.15))' }}
            />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return (
              <div className="rounded-lg border bg-background p-3 shadow-md custom-tooltip">
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
            paddingTop: '16px',
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
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: `${entry.payload.color}15`, // Very light background of the category color
                border: `1px solid ${entry.payload.color}30`,
                whiteSpace: 'nowrap',
                fontWeight: '500'
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

// Helper function to calculate pie chart data
const calculatePieChartData = (expenses: Expense[]) => {
  // Group by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  // Convert to array format for pie chart
  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || "#64748B", // Default to slate if category not found
    percent: 0, // Will be calculated later
  }));
};
