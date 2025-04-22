
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CATEGORY_COLORS, calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { Expense } from "@/components/expenses/types";
import React from "react";

// Custom label renderer that places values inside each slice
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const radian = Math.PI / 180;
  const x = cx + radius * Math.cos(-midAngle * radian);
  const y = cy + radius * Math.sin(-midAngle * radian);
  
  if (percent < 0.05) return null; // Don't show labels for tiny slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="#fff" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontSize={14}
      fontWeight="bold"
      style={{ textShadow: "0px 0px 2px rgba(0,0,0,0.5)" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  // Calculate pie data and total amount
  const data = calculatePieChartData(expenses);
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Responsive sizing
  const chartSize = isMobile ? 200 : 260;
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow-md border text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value, currencyCode)}</p>
          <p>{`${(payload[0].payload.percent).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center h-[300px] w-full overflow-visible">
      {/* Chart Container */}
      <div className="relative" style={{ width: chartSize, height: chartSize }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={chartSize / 2}
              innerRadius={chartSize / 5}
              dataKey="value"
              animationDuration={700}
              animationBegin={0}
              paddingAngle={2}
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Total in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-xl font-bold">{formatCurrency(totalAmount, currencyCode)}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className={`flex flex-wrap justify-center mt-2 gap-2 px-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
        {data.map((entry, index) => (
          <div 
            key={`legend-${index}`}
            className="flex items-center bg-background rounded-full px-2 py-1 shadow-sm"
            style={{ border: `1px solid ${entry.color}30` }}
          >
            <div 
              className="w-3 h-3 rounded-full mr-1.5" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="mr-1 font-medium truncate max-w-[70px]" title={entry.name}>
              {entry.name}
            </span>
            <span className="opacity-75">
              {(entry.percent).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
