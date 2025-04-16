
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { Expense } from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

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
  
  // Get total amount
  const totalAmount = pieChartData.reduce((sum, item) => sum + item.value, 0);
  
  // Get main percentage (for the largest category)
  const mainPercentage = pieChartData.length > 0 
    ? Math.round(pieChartData[0].percent * 100) 
    : 0;
  
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Display the center percentage */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
        <span className="text-4xl font-bold">{mainPercentage}%</span>
      </div>
      
      <ResponsiveContainer width="100%" height={isMobile ? 280 : 340}>
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={pieChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={isMobile ? 110 : 130}
            innerRadius={isMobile ? 75 : 90}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            cornerRadius={4}
            labelLine={false}
            // Disable labels for a cleaner appearance matching the reference image
            label={false}
          >
            {pieChartData.map((entry, index) => (
              <Cell 
                key={`${entry.name}-${index}`} 
                fill={entry.color} 
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0];
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border bg-background/95 p-2 shadow-sm text-left"
                >
                  <p className="text-sm font-medium mb-1">
                    {data.name}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(Number(data.value), currencyCode)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(data.payload.percent * 100).toFixed(1)}% of total
                  </p>
                </motion.div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Simple legend below the chart */}
      <div className="flex flex-wrap justify-center mt-2 gap-3">
        {pieChartData.slice(0, 5).map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5 text-sm">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium">
              {entry.name.length > 10 ? entry.name.slice(0, 10) + "..." : entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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
