
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Expense } from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpenseAnalyticsCardProps {
  expenses: Expense[];
  isLoading: boolean;
  chartType: 'pie' | 'bar' | 'line';
  setChartType: (type: 'pie' | 'bar' | 'line') => void;
}

export const ExpenseAnalyticsCard = ({
  expenses,
  isLoading,
  chartType,
  setChartType,
}: ExpenseAnalyticsCardProps) => {
  const isMobile = useIsMobile();

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return <ExpensePieChart expenses={expenses} />;
      case 'bar':
        return <ExpenseBarChart expenses={expenses} />;
      case 'line':
        return <ExpenseLineChart expenses={expenses} />;
      default:
        return null;
    }
  };

  return (
    <Card className="mt-6 modern-card animate-fade-in">
      <CardHeader className="flex flex-col space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
          <CardTitle className={isMobile ? 'text-lg gradient-text' : 'gradient-text'}>Expense Analytics</CardTitle>
          <Select value={chartType} onValueChange={(value: 'pie' | 'bar' | 'line') => setChartType(value)}>
            <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[180px]'} frosted-card`}>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent className="frosted-card animate-scale-in">
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="skeleton-pulse h-48 w-full rounded-xl" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
            Add some expenses to see analytics
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-xl p-2">
            {renderChart()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
