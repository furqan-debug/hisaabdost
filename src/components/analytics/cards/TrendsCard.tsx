
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesBarChart } from "@/components/analytics/ExpensesBarChart";
import { ChartContainer } from "@/components/ui/chart";
import { useAllCategories } from "@/hooks/useAllCategories";
import { motion } from "framer-motion";

interface TrendsCardProps {
  expenses: any[];
}

export function TrendsCard({ expenses }: TrendsCardProps) {
  const { categories } = useAllCategories();
  
  const chartConfig = categories.reduce((acc, category) => {
    acc[category.value] = {
      color: category.color
    };
    return acc;
  }, {} as Record<string, { color: string }>);

  // Simple trend analysis
  const getRandomTrendMessage = () => {
    const messages = [
      "📈 Your spending patterns are looking good!",
      "🎯 Keep tracking to spot trends easier",
      "💫 Every expense tells a story",
      "🔍 Trends become clearer with more data"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
            <span className="text-2xl">📈</span>
            Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {expenses.length > 0 ? (
            <>
              <div className="h-[280px]">
                <ChartContainer config={chartConfig}>
                  <ExpensesBarChart expenses={expenses} />
                </ChartContainer>
              </div>
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  {getRandomTrendMessage()}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-muted-foreground">Add expenses to see trends</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
