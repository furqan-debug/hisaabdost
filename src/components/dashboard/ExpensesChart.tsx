
import React from "react";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart } from "lucide-react";
import { Expense } from "@/components/expenses/types";
import { cn } from "@/lib/utils";

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
        <h3 className="text-sm font-medium flex items-center">
          <span className={cn(
            "inline-block w-2 h-2 rounded-full mr-2",
            chartType === "bar" ? "bg-primary" : "bg-emerald-500"
          )}></span>
          Expense Trends
        </h3>
        <div className="flex gap-1 bg-background/50 p-1 rounded-lg">
          <Button
            variant={chartType === "bar" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setChartType("bar")}
            className={cn(
              "h-7 w-7",
              chartType === "bar" ? "" : "text-muted-foreground"
            )}
          >
            <BarChart className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "line" ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setChartType("line")}
            className={cn(
              "h-7 w-7",
              chartType === "line" ? "" : "text-muted-foreground"
            )}
          >
            <LineChart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-card/50 rounded-lg p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-sm text-muted-foreground">Add expenses to see trends</p>
          </div>
        ) : chartType === "bar" ? (
          <div className="h-[250px]">
            <ExpenseBarChart expenses={expenses} isLoading={isLoading} />
          </div>
        ) : (
          <div className="h-[250px]">
            <ExpenseLineChart expenses={expenses} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
};
