
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React from "react";

interface PercentageChangeProps {
  value: number;
  inverse?: boolean;
}

export const PercentageChange = ({ value, inverse = false }: PercentageChangeProps) => {
  const isPositive = inverse ? value < 0 : value > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const textColor = isPositive ? "text-expense-high" : "text-expense-low";

  return (
    <div className={`flex items-center ${textColor} text-xs mt-1`}>
      <Icon className="h-3 w-3 mr-1" />
      {Math.abs(value).toFixed(1)}% from last month
    </div>
  );
};
