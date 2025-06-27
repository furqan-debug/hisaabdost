
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChartContainer } from "@/components/ui/chart";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { OverviewTab } from "./tabs/OverviewTab";
import { TrendsTab } from "./tabs/TrendsTab";
import { ComparisonTab } from "./tabs/ComparisonTab";
import { SummaryTab } from "./tabs/SummaryTab";

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

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md overflow-hidden rounded-xl">
      <CardContent className="p-0">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b-0 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm p-2 h-auto flex-wrap gap-1 md:flex-nowrap">
            <TabsTrigger 
              value="summary" 
              className="flex-1 min-w-0 rounded-lg border-0 px-3 py-2.5 text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20 whitespace-nowrap"
            >
              Smart Summary
            </TabsTrigger>
            <TabsTrigger 
              value="overview" 
              className="flex-1 min-w-0 rounded-lg border-0 px-3 py-2.5 text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20 whitespace-nowrap"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="trends" 
              className="flex-1 min-w-0 rounded-lg border-0 px-3 py-2.5 text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20 whitespace-nowrap"
            >
              Trends
            </TabsTrigger>
            <TabsTrigger 
              value="comparison" 
              className="flex-1 min-w-0 rounded-lg border-0 px-3 py-2.5 text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20 whitespace-nowrap"
            >
              Compare
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6 px-4 md:px-6 pb-6 py-0 my-[38px]">
            <TabsContent value="summary" className="mt-0 focus:outline-none focus:ring-0">
              <motion.div initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.3
            }}>
                <SummaryTab expenses={filteredExpenses} />
              </motion.div>
            </TabsContent>

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
    </Card>
  );
}
