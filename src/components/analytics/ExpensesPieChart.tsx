
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Expense {
  amount: number;
  category: string;
}

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({
  expenses
}: ExpensesPieChartProps) {
  const isMobile = useIsMobile();
  
  const data = Object.entries(expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#94A3B8',
    percent: 0 // This will be calculated below
  }));

  // Calculate percentages based on total
  const total = data.reduce((sum, item) => sum + item.value, 0);
  data.forEach(item => {
    item.percent = total > 0 ? item.value / total * 100 : 0;
  });

  // Get main percentage (for the largest category)
  const mainPercentage = data.length > 0 ? Math.round(data[0].percent) : 0;
  const mainCategory = data.length > 0 ? data[0].name : "No data";
  
  return (
    <div className="chart-wrapper relative w-full flex flex-col items-center px-2 pb-6">
      {/* Display the center percentage - moved outside chart for permanent visibility */}
      <div className="chart-center-percentage absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
        <span className="text-2xl font-semibold text-primary-foreground bg-background/60 backdrop-blur-sm rounded-full px-3 py-1">{mainPercentage}%</span>
        <div className="text-xs text-muted-foreground mt-1 text-center bg-background/60 backdrop-blur-sm rounded-full px-2 py-0.5">
          {mainCategory}
        </div>
      </div>
      
      <div className="w-full h-[240px]"> {/* Fixed height container */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart 
            margin={isMobile ? {
              top: 10,
              right: 10,
              left: 10,
              bottom: 10
            } : {
              top: 10,
              right: 10,
              left: 10,
              bottom: 10
            }} 
            className="mx-auto"
          >
            <Pie 
              data={data} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={isMobile ? 85 : 110} 
              innerRadius={isMobile ? 60 : 80} 
              paddingAngle={0} 
              startAngle={90} 
              endAngle={-270} 
              cornerRadius={0}
              strokeWidth={0}
              labelLine={false} 
              label={false} 
              isAnimationActive={true} 
              animationDuration={800} 
              animationBegin={0} 
              animationEasing="ease-out"
            >
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
            </Pie>
            
            {/* Removed Tooltip component */}
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend with better spacing */}
      <div className="expense-chart-legend mt-6 w-full flex flex-wrap justify-center gap-1.5">
        {data.slice(0, isMobile ? 5 : 6).map((entry, index) => (
          <div key={index} className="expense-chart-legend-item">
            <div 
              className="expense-chart-legend-dot" 
              style={{
                backgroundColor: entry.color
              }} 
            />
            <span className="truncate max-w-[90px]">
              {entry.name.length > 10 ? entry.name.slice(0, 10) + "..." : entry.name}
            </span>
            <span className="font-medium ml-1">
              {entry.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
