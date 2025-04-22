
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CATEGORY_COLORS, calculatePieChartData } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { Expense } from "@/components/expenses/types";
import React from "react";

// Custom label renderer that places values in the middle of each sector, like your example image
const renderSliceLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, index, fill } = props;
  // calculate position for label
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.68;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  // Show value as integer percent or integer value
  return (
    <text
      x={x}
      y={y}
      fill="#222"
      fontSize={19}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontWeight: 600,
        textShadow: "0 1px 8px #fff8",
        pointerEvents: "none"
      }}
    >
      {value}
    </text>
  );
};

interface ExpensesPieChartProps {
  expenses: Expense[];
}

export function ExpensesPieChart({ expenses }: ExpensesPieChartProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  // Pie chart data (top N categories)
  const data = calculatePieChartData(expenses);
  // Total for percent-of-total
  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Responsive chart sizing
  const chartSize = isMobile ? 225 : 300;
  const innerRadius = isMobile ? 70 : 98;
  const legendColumn = isMobile ? false : true;

  return (
    <div
      className={
        "flex w-full h-full items-center justify-center " +
        (isMobile ? "flex-col max-h-[300px]" : "flex-row max-h-[300px]")
      }
      style={{ minHeight: 240, maxHeight: 300, height: 300 }}
    >
      <div className="flex-shrink-0 flex items-center justify-center"
        style={{ width: chartSize, height: chartSize, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              outerRadius="98%"
              innerRadius={innerRadius}
              stroke="#ffffff"
              strokeWidth={2}
              label={renderSliceLabel}
              labelLine={false}
              isAnimationActive={true}
              paddingAngle={2}
              cornerRadius={10}
            >
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ transition: "opacity .2s" }}
                />
              ))}
            </Pie>
            {/* No default tooltip or legend */}
          </PieChart>
        </ResponsiveContainer>
        {/* Pie total amount in center */}
        <div
          className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center pointer-events-none"
          style={{
            transform: "translate(-50%, -50%)",
            zIndex: 3
          }}
        >
          <span
            className="font-semibold text-[1.25rem] md:text-[1.55rem]"
            style={{ color: "#222", textShadow: "0 2px 8px #fff8", lineHeight: 1 }}
          >
            {formatCurrency(totalAmount, currencyCode)}
          </span>
          <span className="text-sm text-muted-foreground">Total</span>
        </div>
      </div>
      {/* Custom Legend: beside pie on desktop, below on mobile */}
      <div
        className={
          "flex " +
          (legendColumn
            ? "flex-col items-start justify-center ml-7"
            : "flex-row flex-wrap items-center justify-center mt-2")
        }
        style={{
          gap: legendColumn ? "0.6rem" : "0.85rem",
          width: legendColumn ? 110 : "100%",
          minWidth: isMobile ? 0 : 90,
        }}
      >
        {data.map((entry, idx) => (
          <div
            key={entry.name}
            className="flex items-center font-medium rounded-full px-2"
            style={{
              background: entry.color + "22",
              color: "#222",
              gap: "0.57em",
              minWidth: 0,
              fontSize: isMobile ? 13.2 : 15,
              height: 26,
              margin: 0
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 18,
                height: 18,
                backgroundColor: entry.color,
                borderRadius: "100%",
                marginRight: 7,
                border: "1.5px solid #fff",
                boxShadow: "0 1px 4px #0001"
              }}
            />
            <span className="truncate max-w-[70px]" title={entry.name}>
              {entry.name.length > 14 ? entry.name.slice(0, 13) + "…" : entry.name}
            </span>
            <span className="ml-1 text-xs font-semibold" style={{ color: "#222" }}>
              {entry.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
