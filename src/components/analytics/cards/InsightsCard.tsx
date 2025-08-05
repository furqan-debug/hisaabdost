
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";
import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface InsightsCardProps {
  expenses: any[];
}

export function InsightsCard({ expenses }: InsightsCardProps) {
  const { currencyCode } = useCurrency();
  const insights = useAnalyticsInsights(expenses);

  // Create friendly AI message
  const getFriendlyMessage = () => {
    if (!expenses.length) {
      return "🤖 I'll analyze your spending once you add some expenses!";
    }

    const totalSpending = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const avgDaily = totalSpending / Math.max(expenses.length, 1);

    const messages = [
      `🤖 Your daily average is ${formatCurrency(avgDaily, currencyCode)}. Not bad!`,
      `💡 I notice you're tracking ${expenses.length} expenses. Great habit!`,
      `🎯 Your spending awareness is already improving by using this app!`,
      `✨ Keep it up! Every tracked expense is a step toward better budgeting.`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold">
            <span className="text-2xl">🤖</span>
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {insights.length > 0 ? (
              <>
                {insights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg border-l-4 border-primary/50">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {insight.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          {insight.message}
                        </p>
                        {insight.recommendation && (
                          <p className="text-xs text-muted-foreground">
                            {insight.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-muted-foreground">Add expenses for AI insights</p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-border/30">
              <p className="text-sm text-center text-muted-foreground">
                {getFriendlyMessage()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
