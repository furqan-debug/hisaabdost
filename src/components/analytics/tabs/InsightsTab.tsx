
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface InsightsTabProps {
  expenses: any[];
}

export function InsightsTab({ expenses }: InsightsTabProps) {
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
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 text-center">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          AI-Powered Insights
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Smart analysis of your spending patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          {insights.length > 0 ? (
            <>
              {insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg border-l-4 border-primary/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5 text-xl">
                      {insight.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">
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
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-muted-foreground">Add expenses to see AI insights</p>
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
  );
}
