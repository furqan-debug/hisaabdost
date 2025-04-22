
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensePieChart } from "@/components/charts/ExpensePieChart";
import { ExpenseBarChart } from "@/components/charts/ExpenseBarChart";
import { ExpenseLineChart } from "@/components/charts/ExpenseLineChart";
import { Expense } from "@/components/expenses/types";
import { useIsMobile } from "@/hooks/use-mobile";
// Use chart icons
import { ChartPie, ChartBar, ChartLine } from "lucide-react";
import { motion } from "framer-motion";
import { ChartContainer } from "@/components/ui/chart";
import { CATEGORY_COLORS } from "@/utils/chartUtils";

// Remove glass and modern card class, use custom gradient for vibrant effect:
const analyticsCardClass =
  "analytics-gradient border-0 rounded-2xl shadow-xl transition-all duration-300 p-0";

// Icon map for chart types
const chartIcons = {
  pie: <ChartPie className="w-7 h-7 md:w-9 md:h-9 text-indigo-500" />,
  bar: <ChartBar className="w-7 h-7 md:w-9 md:h-9 text-rose-500" />,
  line: <ChartLine className="w-7 h-7 md:w-9 md:h-9 text-emerald-500" />,
};

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

  // Render chart with integrated icon above chart
  const renderChartSection = () => (
    <div className="w-full flex flex-col items-center">
      <div className="mb-1 flex items-center gap-2">
        <div className="rounded-xl bg-white/80 shadow p-2">
          {chartIcons[chartType]}
        </div>
        <span className="text-base md:text-lg font-bold gradient-text">
          {chartType === "pie" && "Pie Chart"}
          {chartType === "bar" && "Bar Chart"}
          {chartType === "line" && "Line Chart"}
        </span>
      </div>
      <div className="w-full">
        {
          chartType === 'pie' ? <ExpensePieChart expenses={expenses} /> :
          chartType === 'bar' ? <ExpenseBarChart expenses={expenses} /> :
          chartType === 'line' ? <ExpenseLineChart expenses={expenses} /> :
          null
        }
      </div>
    </div>
  );

  const chartConfig = Object.entries(CATEGORY_COLORS).reduce((acc, [key, color]) => {
    acc[key] = { color };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <Card className={analyticsCardClass + " px-0 py-0 md:p-0"}>
      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100 rounded-t-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2">
          <CardTitle className={isMobile ? 'text-base' : ''}>
            Expense Analytics
          </CardTitle>
          <div className="flex items-center">
            <div className="bg-white/80 rounded-lg p-1 flex shadow-md">
              <button 
                onClick={() => setChartType('pie')} 
                className={`p-1.5 rounded-md transition-all analytics-toggle-btn ${chartType === 'pie' ? 'bg-primary/10 shadow text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                aria-label="Pie chart"
              >
                <ChartPie className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setChartType('bar')} 
                className={`p-1.5 rounded-md transition-all analytics-toggle-btn ${chartType === 'bar' ? 'bg-primary/10 shadow text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                aria-label="Bar chart"
              >
                <ChartBar className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setChartType('line')} 
                className={`p-1.5 rounded-md transition-all analytics-toggle-btn ${chartType === 'line' ? 'bg-primary/10 shadow text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                aria-label="Line chart"
              >
                <ChartLine className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-4 bg-white/90 rounded-b-2xl">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Add some expenses to see analytics
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            key={chartType}
          >
            <ChartContainer config={chartConfig} className="h-full w-full">
              {renderChartSection()}
            </ChartContainer>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
