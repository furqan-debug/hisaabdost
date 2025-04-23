import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import { ChartContainer } from "@/components/charts/ChartContainer";
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
  }, {} as Record<string, { color: string; }>);

  return (
    <Card className="overflow-hidden shadow-sm border-border/50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
          <CardTitle className={isMobile ? 'text-base' : ''}>Expense Analytics</CardTitle>
          <div className="flex items-center">
            <div className="bg-muted/20 rounded-lg p-1 flex gap-1">
              {[
                { type: 'pie', icon: PieChart },
                { type: 'bar', icon: BarChart3 },
                { type: 'line', icon: LineChart }
              ].map(({ type, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type as 'pie' | 'bar' | 'line')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    chartType === type 
                      ? "bg-background shadow-sm text-primary" 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                  aria-label={`${type} chart`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <p className="text-muted-foreground">Add some expenses to see analytics</p>
          </div>
        ) : (
          <motion.div 
            className="min-h-[300px] w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            key={chartType}
          >
            <ChartContainer config={chartConfig}>
              {renderChart()}
            </ChartContainer>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
