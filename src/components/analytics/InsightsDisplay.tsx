
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Insight } from "@/hooks/useAnalyticsInsights";

interface InsightsDisplayProps {
  insights: Insight[];
}

export function InsightsDisplay({ insights }: InsightsDisplayProps) {
  return (
    <div className="grid gap-4">
      {insights.map((insight, index) => (
        <Alert key={index} variant={insight.type === 'warning' ? 'destructive' : 'default'}>
          <div className="flex gap-2">
            {insight.icon}
            <div className="space-y-1">
              <AlertDescription>{insight.message}</AlertDescription>
              {insight.recommendation && (
                <AlertDescription className="text-sm text-muted-foreground">
                  💡 {insight.recommendation}
                </AlertDescription>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
