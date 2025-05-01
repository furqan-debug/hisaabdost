
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import { ChartContainer } from "@/components/ui/chart";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  setChartType
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

  const chartConfig = Object.entries(CATEGORY_COLORS).reduce((acc, [key, color]) => {
    acc[key] = { color };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <Card className={cn(
      "overflow-hidden shadow-sm border-border/50", 
      isMobile && "w-full max-w-md mx-auto"
    )}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
          <CardTitle className={cn(
            "text-lg font-semibold", 
            isMobile && "text-center w-full"
          )}>
            Expense Analytics
          </CardTitle>
          <div className="flex items-center">
            <div className="bg-background/5 backdrop-blur-sm rounded-lg p-1 flex gap-1">
              <button 
                onClick={() => setChartType('pie')} 
                className={cn(
                  "p-1.5 rounded-md transition-all", 
                  chartType === 'pie' 
                    ? "bg-background shadow-sm text-primary" 
                    : "hover:bg-muted text-muted-foreground hover:text-primary"
                )} 
                aria-label="Pie chart"
              >
                <PieChart className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setChartType('bar')} 
                className={cn(
                  "p-1.5 rounded-md transition-all", 
                  chartType === 'bar' 
                    ? "bg-background shadow-sm text-primary" 
                    : "hover:bg-muted text-muted-foreground hover:text-primary"
                )} 
                aria-label="Bar chart"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setChartType('line')} 
                className={cn(
                  "p-1.5 rounded-md transition-all", 
                  chartType === 'line' 
                    ? "bg-background shadow-sm text-primary" 
                    : "hover:bg-muted text-muted-foreground hover:text-primary"
                )} 
                aria-label="Line chart"
              >
                <LineChart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn(
  "pt-2 pb-4 mx-0 overflow-x-hidden",
  isMobile ? "max-h-[calc(100dvh-180px)] overflow-y-auto px-3" : ""
)}>
  {isLoading ? (
    <div className="flex justify-center items-center h-[350px]">
      <p className="text-muted-foreground">Loading analytics...</p>
    </div>
  ) : expenses.length === 0 ? (
    <div className="flex justify-center items-center h-[350px]">
      <p className="text-muted-foreground">Add some expenses to see analytics</p>
    </div>
  ) : (
    <div className="w-full flex flex-col items-center gap-6">
      <motion.div
        className={cn(
          "w-full max-w-[500px] min-h-[320px]",
          isMobile && "max-w-[300px]"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        key={chartType}
      >
        <ChartContainer
          className="h-full w-full min-h-[320px]"
          config={chartConfig}
        >
          {renderChart()}
        </ChartContainer>
      </motion.div>
      {/* Legend renders automatically from ChartContainer in most setups */}
    </div>
  )}
</CardContent>

    </Card>
  );
};
