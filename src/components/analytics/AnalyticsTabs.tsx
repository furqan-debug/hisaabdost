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
export function AnalyticsTabs({
  filteredExpenses
}: AnalyticsTabsProps) {
  const chartConfig = Object.entries(CATEGORY_COLORS).reduce((acc, [key, color]) => {
    acc[key] = {
      color
    };
    return acc;
  }, {} as Record<string, {
    color: string;
  }>);
  return <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md overflow-hidden rounded-xl">
      <CardContent className="p-0">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b-0 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm p-0 my-[4px] h-12 px-[5px] mx-[-5px]">
            <TabsTrigger value="overview" className="rounded-lg border-0 mx-1 px-6 py-2.5 font-medium transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="rounded-lg border-0 mx-1 px-6 py-2.5 font-medium transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20">
              Trends
            </TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-lg border-0 mx-1 px-6 py-2.5 font-medium transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20">
              Compare
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6 px-4 md:px-6 pb-6 py-0 my-[38px]">
            <TabsContent value="overview" className="mt-0 focus:outline-none focus:ring-0">
              <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3
            }}>
                <OverviewTab expenses={filteredExpenses} config={chartConfig} />
              </motion.div>
            </TabsContent>

            <TabsContent value="trends" className="mt-0 space-y-4 focus:outline-none focus:ring-0">
              <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3
            }}>
                <TrendsTab expenses={filteredExpenses} config={chartConfig} />
              </motion.div>
            </TabsContent>

            <TabsContent value="comparison" className="mt-0 focus:outline-none focus:ring-0">
              <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3
            }}>
                <ComparisonTab expenses={filteredExpenses} />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>;
}