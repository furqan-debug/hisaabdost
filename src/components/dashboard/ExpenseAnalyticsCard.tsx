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
    acc[key] = {
      color
    };
    return acc;
  }, {} as Record<string, {
    color: string;
  }>);
  return <Card className="overflow-hidden shadow-sm border-border/50 dark:bg-[#1a1f2c]">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
          <CardTitle className={isMobile ? 'text-base' : ''}>Expense Analytics</CardTitle>
          <div className="flex items-center">
            <div className="bg-muted/30 rounded-lg p-1 flex">
              <button onClick={() => setChartType('pie')} className={`p-1.5 rounded-md transition-all ${chartType === 'pie' ? 'bg-background shadow-sm text-primary' : 'hover:bg-muted text-muted-foreground'}`} aria-label="Pie chart">
                <PieChart className="h-4 w-4" />
              </button>
              <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-background shadow-sm text-primary' : 'hover:bg-muted text-muted-foreground'}`} aria-label="Bar chart">
                <BarChart3 className="h-4 w-4" />
              </button>
              <button onClick={() => setChartType('line')} className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-background shadow-sm text-primary' : 'hover:bg-muted text-muted-foreground'}`} aria-label="Line chart">
                <LineChart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-4 mx--10">
        {isLoading ? <div className="flex justify-center p-6">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div> : expenses.length === 0 ? <div className="text-center text-muted-foreground py-8">
            Add some expenses to see analytics
          </div> : <ScrollArea className="h-[350px] w-full">
            <motion.div className="min-h-[320px] w-full" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.3
        }} key={chartType}>
              <ChartContainer config={chartConfig} className="h-full w-full min-h-[320px]">
                {renderChart()}
              </ChartContainer>
            </motion.div>
          </ScrollArea>}
      </CardContent>
    </Card>;
};