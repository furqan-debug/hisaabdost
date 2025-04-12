
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChartIcon, LineChartIcon, PieChartIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ChartContainer } from "@/components/ui/chart";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { useCurrency } from "@/hooks/use-currency";

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
  const { currencyCode } = useCurrency();
  
  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return <ExpensePieChart expenses={expenses} currencyCode={currencyCode} />;
      case 'bar':
        return <ExpenseBarChart expenses={expenses} currencyCode={currencyCode} />;
      case 'line':
        return <ExpenseLineChart expenses={expenses} currencyCode={currencyCode} />;
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
  
  return <Card className="mt-4 overflow-hidden px- my-[14px] mx-0 px-px py-[17px]">
      <CardHeader className="flex flex-col space-y-2 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 p my-[-3px]">
          <CardTitle className={isMobile ? 'text-base' : ''}>Expense Analytics</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="bg-muted/50 rounded-lg p-1 flex">
              <button onClick={() => setChartType('pie')} className={`p-1.5 rounded-md transition-all ${chartType === 'pie' ? 'bg-background shadow-sm' : 'hover:bg-muted'}`} aria-label="Pie chart">
                <PieChartIcon className="h-4 w-4" />
              </button>
              <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-background shadow-sm' : 'hover:bg-muted'}`} aria-label="Bar chart">
                <BarChartIcon className="h-4 w-4" />
              </button>
              <button onClick={() => setChartType('line')} className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-background shadow-sm' : 'hover:bg-muted'}`} aria-label="Line chart">
                <LineChartIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="sm:px-4 pb-6 my-[7px] mx-0 px-0 py-px">
        {isLoading ? <div className="flex justify-center p-6">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div> : expenses.length === 0 ? <div className="text-center text-muted-foreground py-8">
            Add some expenses to see analytics
          </div> : <motion.div className="w-full overflow-hidden" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.5
      }} key={chartType} // Re-run animation when chart type changes
      >
            <ChartContainer config={chartConfig} className="mx-[-12px] my-0 py-0">
              {renderChart()}
            </ChartContainer>
          </motion.div>}
      </CardContent>
    </Card>;
};
