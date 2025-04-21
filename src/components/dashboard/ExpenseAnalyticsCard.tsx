import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_COLORS } from "@/utils/chartUtils";

interface ExpenseAnalyticsCardProps {
  expenses: Expense[];
  isLoading: boolean;
  chartType: "pie" | "bar" | "line";
  setChartType: (type: "pie" | "bar" | "line") => void;
}

export function ExpenseAnalyticsCard({
  expenses,
  isLoading,
  chartType,
  setChartType
}: ExpenseAnalyticsCardProps) {
  const isMobile = useIsMobile();

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return <ExpensePieChart expenses={expenses} />;
      case "bar":
        return <ExpenseBarChart expenses={expenses} />;
      case "line":
        return <ExpenseLineChart expenses={expenses} />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between pb-1">
        <CardTitle>Analytics</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={chartType === "pie" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setChartType("pie")}
          >
            <PieChart className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "bar" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setChartType("bar")}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant={chartType === "line" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setChartType("line")}
          >
            <LineChart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
}
