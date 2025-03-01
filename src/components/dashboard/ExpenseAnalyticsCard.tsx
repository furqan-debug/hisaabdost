
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
    <Card className="mt-6">
      <CardHeader className={`flex flex-${isMobile ? 'col space-y-2' : 'row items-center justify-between'}`}>
        <CardTitle className={isMobile ? 'text-lg' : ''}>Expense Analytics</CardTitle>
        <Select value={chartType} onValueChange={(value: 'pie' | 'bar' | 'line') => setChartType(value)}>
          <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[180px]'}`}>
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className={isMobile ? 'p-2' : ''}>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Add some expenses to see analytics
          </div>
        ) : (
          <div className={`w-full ${isMobile ? 'h-64' : 'h-80'}`}>
            {renderChart()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
