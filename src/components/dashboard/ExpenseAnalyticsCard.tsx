
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Expense } from "@/components/AddExpenseSheet";

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
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expense Analytics</CardTitle>
        <Select value={chartType} onValueChange={(value: 'pie' | 'bar' | 'line') => setChartType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Add some expenses to see analytics
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
};
