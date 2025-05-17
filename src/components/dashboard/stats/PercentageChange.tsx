
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React from "react";

interface PercentageChangeProps {
  value: number;
  inverse?: boolean;
}

export const PercentageChange = ({ value, inverse = false }: PercentageChangeProps) => {
  // If the value is very close to zero, display as "No change"
  if (Math.abs(value) < 0.1) {
    return (
      <div className="text-xs text-muted-foreground">
        No change from last month
      </div>
    );
  }
  
  // Determine if the change is positive (based on the inverse flag)
  const isPositive = inverse ? value < 0 : value > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  
  // Choose color based on whether the change is positive/negative and if inverse is set
  const textColor = isPositive ? "text-emerald-500" : "text-red-500";

  return (
    <div className={`flex items-center ${textColor} text-xs`}>
      <Icon className="h-3 w-3 mr-1" />
      {Math.abs(value).toFixed(1)}% from last month
    </div>
  );
};
