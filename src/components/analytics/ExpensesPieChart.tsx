
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CATEGORY_COLORS, calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Expense } from "@/components/expenses/types";
import React from "react";

/**
 * Custom pastel colors picked for clear contrast and similarity to your reference image
 * (override CATEGORY_COLORS for the chart, up to 8 slices for best readability)
 */
const PIE_COLORS: string[] = [
  "#5B66F3", // Blue (Monopoly-like)
  "#F58A2E", // Orange (Candyland-like)
  "#EA3AB2", // Pink (Jenga, Chess)
  "#9446D6", // Purple
  "#E23DA1", // Magenta
  "#9578FC", // Lilac
  "#FDE059", // Yellow
  "#28D7CE", // Teal
];

/**
 * Custom label: show category name and percentage centered in each slice
 */
const renderSliceLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const radian = Math.PI / 180;
  const x = cx + radius * Math.cos(-midAngle * radian);
  const y = cy + radius * Math.sin(-midAngle * radian);
  if (percent < 0.04) return null; // Hide for slices <4%

  // Label line 1 = name, line 2 = percent
  return (
    <g>
      <text
        x={x}
        y={y - 6}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight="bold"
        style={{
          textShadow: "0px 0px 4px rgba(0,0,0,.25)"
        }}
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 10}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{
          textShadow: "0px 0px 4px rgba(0,0,0,.22)"
        }}
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    </g>
  );
};

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const isMobile = useIsMobile();

  // Prepare clean data: top 8 by value for best clarity (to fit all inside)
  const dataRaw = calculatePieChartData(expenses)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Recalculate total for correct percentages
  const total = dataRaw.reduce((sum, entry) => sum + entry.value, 0);
  const data = dataRaw.map((entry, i) => ({
    ...entry,
    percent: total > 0 ? entry.value / total : 0,
    color: PIE_COLORS[i % PIE_COLORS.length]
  }));

  // Responsive sizing
  const chartSize = Math.min(300, isMobile ? 220 : 300);

  return (
    <div
      className="flex items-center justify-center w-full"
      style={{ minHeight: chartSize, height: chartSize, maxHeight: chartSize }}
    >
      <div
        style={{
          width: chartSize,
          height: chartSize,
          maxWidth: "100%",
          maxHeight: chartSize,
          background: "white",
          borderRadius: "8px",
          boxShadow: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={450}
              labelLine={false}
              label={renderSliceLabel}
              outerRadius="98%"
              innerRadius={0}
              dataKey="value"
              isAnimationActive={false}
              paddingAngle={2}
              stroke="#222"
              strokeWidth={2}
            >
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.color}
                  stroke="#222"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
