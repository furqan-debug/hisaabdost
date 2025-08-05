
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AnalyticsSummary } from "./AnalyticsSummary";
import { OverviewCard } from "./cards/OverviewCard";
import { TrendsCard } from "./cards/TrendsCard";
import { InsightsCard } from "./cards/InsightsCard";
import { CompareCard } from "./cards/CompareCard";
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
          
          {/* Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OverviewCard expenses={filteredExpenses} />
            <TrendsCard expenses={filteredExpenses} />
            <InsightsCard expenses={filteredExpenses} />
            <CompareCard expenses={filteredExpenses} />
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
