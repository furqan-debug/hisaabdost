
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
  percent: number;
}

export const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const pieChartData = calculatePieChartData(expenses) as PieChartDataItem[];
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
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
          innerRadius={isMobile ? 50 : 80}
          paddingAngle={2}
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
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return (
              <div className="rounded-lg border bg-background/95 p-2 shadow-sm text-left">
                <p className="text-sm font-medium mb-1">
                  {data.name}
                </p>
                <p className="text-sm font-semibold">
                  {formatCurrency(Number(data.value), currencyCode)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
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
            fontSize: isMobile ? '11px' : '12px',
            paddingTop: '16px',
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '4px'
          }}
          formatter={(value, entry: any) => {
            // Show minimalist legend entries
            const displayName = value.length > 10 ? `${value.slice(0, 10)}...` : value;
            
            return (
              <span style={{ 
                color: 'var(--foreground)', 
                display: 'inline-block',
                padding: '2px 5px',
                margin: '0 2px',
                fontSize: isMobile ? '10px' : '11px',
                fontWeight: '500',
                borderRadius: '3px',
                border: `1px solid ${entry.payload.color}30`,
                backgroundColor: 'transparent'
              }}>
                {displayName}
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

  // Sort by value in descending order
  const sortedEntries = Object.entries(categoryTotals)
    .sort(([, valueA], [, valueB]) => valueB - valueA);

  // Calculate total for percentages
  const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

  // Convert to array format for pie chart
  return sortedEntries.map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || "#94A3B8", // Default to gray if category not found
    percent: total > 0 ? value / total : 0, // Add percent property
  }));
};
