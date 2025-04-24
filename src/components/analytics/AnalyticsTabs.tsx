
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ExpensesPieChart } from "./ExpensesPieChart";
import { ExpensesBarChart } from "./ExpensesBarChart";
import { ExpensesLineChart } from "./ExpensesLineChart";
import { ExpensesComparison } from "./ExpensesComparison";
import { motion } from "framer-motion";
import { ChartContainer } from "@/components/ui/chart";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { OverviewTab } from "./tabs/OverviewTab";
import { TrendsTab } from "./tabs/TrendsTab";
import { ComparisonTab } from "./tabs/ComparisonTab";

interface AnalyticsTabsProps {
  filteredExpenses: any[];
}

export function AnalyticsTabs({ filteredExpenses }: AnalyticsTabsProps) {
  const chartConfig = Object.entries(CATEGORY_COLORS).reduce((acc, [key, color]) => {
    acc[key] = { color };
    return acc;
  }, {} as Record<string, { color: string; }>);

  return (
    <Card className="border shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 mx-[5px] px-0 my-[4px]">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Trends
            </TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-none border-b-2 border-transparent px-4 py-2.5 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Compare
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4 px-3 md:px-4 pb-4">
            <TabsContent value="overview" className="mt-0 focus:outline-none focus:ring-0">
              <OverviewTab expenses={filteredExpenses} config={chartConfig} />
            </TabsContent>

            <TabsContent value="trends" className="mt-0 space-y-4 focus:outline-none focus:ring-0">
              <TrendsTab expenses={filteredExpenses} config={chartConfig} />
            </TabsContent>

            <TabsContent value="comparison" className="mt-0 focus:outline-none focus:ring-0">
              <ComparisonTab expenses={filteredExpenses} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
