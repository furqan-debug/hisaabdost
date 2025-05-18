
import React from "react";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart } from "lucide-react";
import { Expense } from "@/components/expenses/types";

interface ExpensesChartProps {
  expenses: Expense[];
  isLoading: boolean;
  chartType: "bar" | "line";
  setChartType: (type: "bar" | "line") => void;
}

export const ExpensesChart: React.FC<ExpensesChartProps> = ({
  expenses,
  isLoading,
  chartType,
  setChartType
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Expense Trends</h3>
        <div className="flex gap-1">
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setChartType("bar")}
            className="h-7 w-7"
          >
            <BarChart className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="icon-sm"
            onClick={() => setChartType("line")}
            className="h-7 w-7"
          >
            <LineChart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {chartType === "bar" ? (
        <ExpenseBarChart expenses={expenses} isLoading={isLoading} />
      ) : (
        <ExpenseLineChart expenses={expenses} isLoading={isLoading} />
      )}
    </div>
  );
};
