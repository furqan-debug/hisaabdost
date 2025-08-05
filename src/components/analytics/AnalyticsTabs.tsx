
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AnalyticsSummary } from "./AnalyticsSummary";
import { OverviewTab } from "./tabs/OverviewTab";
import { TrendsTab } from "./tabs/TrendsTab";
import { InsightsTab } from "./tabs/InsightsTab";
import { ComparisonTab } from "./tabs/ComparisonTab";
import { useAllCategories } from "@/hooks/useAllCategories";

interface AnalyticsTabsProps {
  filteredExpenses: any[];
}

export function AnalyticsTabs({ filteredExpenses }: AnalyticsTabsProps) {
  const { categories } = useAllCategories();
  
  const chartConfig = categories.reduce((acc, category) => {
    acc[category.value] = {
      color: category.color
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md overflow-hidden rounded-xl mx-0 px-0">
      <CardContent className="p-4 md:p-6">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Friendly Summary */}
          <AnalyticsSummary expenses={filteredExpenses} />
          
          {/* Tabbed Analytics */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <span className="text-lg">📈</span>
                <span className="hidden sm:inline">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-2">
                <span className="text-lg">⚖️</span>
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <OverviewTab expenses={filteredExpenses} config={chartConfig} />
            </TabsContent>
            
            <TabsContent value="trends" className="mt-6">
              <TrendsTab expenses={filteredExpenses} config={chartConfig} />
            </TabsContent>
            
            <TabsContent value="insights" className="mt-6">
              <InsightsTab expenses={filteredExpenses} />
            </TabsContent>
            
            <TabsContent value="compare" className="mt-6">
              <ComparisonTab expenses={filteredExpenses} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </CardContent>
    </Card>
  );
}
