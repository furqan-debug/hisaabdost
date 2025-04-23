
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Insight } from "@/hooks/useAnalyticsInsights";
import { motion } from "framer-motion";

interface InsightsDisplayProps {
  insights: Insight[];
}

export function InsightsDisplay({ insights }: InsightsDisplayProps) {
  if (insights.length === 0) return null;
  
  return (
    <div className="grid gap-3">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Alert 
            key={index} 
            variant={insight.type === 'warning' ? 'destructive' : 'default'}
            className="py-3 shadow-sm border"
          >
            <div className="flex gap-2.5">
              <div className="mt-0.5">{insight.icon}</div>
              <div className="space-y-1">
                <AlertDescription className="font-medium text-sm">
                  {insight.message}
                </AlertDescription>
                {insight.recommendation && (
                  <AlertDescription className="text-xs text-muted-foreground">
                    💡 {insight.recommendation}
                  </AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        </motion.div>
      ))}
    </div>
  );
}
