
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Insight } from "@/hooks/useAnalyticsInsights";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface InsightsDisplayProps {
  insights: Insight[];
}

export function InsightsDisplay({ insights }: InsightsDisplayProps) {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  if (insights.length === 0) return null;

  // Format currency values in insights messages
  const formattedInsights = insights.map(insight => {
    const formattedMessage = insight.message.replace(
      /\$(\d+(\.\d+)?)/g, 
      (match, amount) => formatCurrency(parseFloat(amount), currencyCode)
    );
    
    let formattedRecommendation = insight.recommendation;
    if (formattedRecommendation) {
      formattedRecommendation = formattedRecommendation.replace(
        /\$(\d+(\.\d+)?)/g, 
        (match, amount) => formatCurrency(parseFloat(amount), currencyCode)
      );
    }
    
    return {
      ...insight,
      message: formattedMessage,
      recommendation: formattedRecommendation
    };
  });
  
  return (
    <motion.div 
      className="grid gap-2.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {formattedInsights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <Alert 
            key={index} 
            variant={insight.type === 'warning' ? 'destructive' : 'default'}
            className={`py-2.5 shadow-sm border ${
              insight.type === 'success' ? 
                'bg-gradient-to-br from-green-50 to-green-100 border-green-300 dark:from-green-950/50 dark:to-green-900/50 dark:border-green-600' : 
              insight.type === 'warning' ? 
                'bg-gradient-to-br from-red-50 to-red-100 border-red-300 dark:from-red-950/50 dark:to-red-900/50 dark:border-red-600' : 
              insight.type === 'highlight' ? 
                'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 dark:from-blue-950/50 dark:to-blue-900/50 dark:border-blue-600' : 
              insight.type === 'tip' ? 
                'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 dark:from-purple-950/50 dark:to-purple-900/50 dark:border-purple-600' :
                'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 dark:from-gray-900/50 dark:to-gray-800/50 dark:border-gray-600'
            }`}
          >
            <div className="flex gap-2">
              <div className="mt-0.5 flex-shrink-0">{insight.icon}</div>
              <div className="space-y-1 overflow-hidden">
                <AlertDescription className={`font-medium text-${isMobile ? 'xs' : 'sm'} leading-snug ${
                  insight.type === 'success' ? 'text-green-800 dark:text-green-200' :
                  insight.type === 'warning' ? 'text-red-800 dark:text-red-200' :
                  insight.type === 'highlight' ? 'text-blue-800 dark:text-blue-200' :
                  insight.type === 'tip' ? 'text-purple-800 dark:text-purple-200' :
                  'text-gray-800 dark:text-gray-200'
                }`}>
                  {insight.message}
                </AlertDescription>
                {insight.recommendation && (
                  <AlertDescription className={`text-xs ${isMobile ? 'line-clamp-2' : ''} ${
                    insight.type === 'success' ? 'text-green-700 dark:text-green-300' :
                    insight.type === 'warning' ? 'text-red-700 dark:text-red-300' :
                    insight.type === 'highlight' ? 'text-blue-700 dark:text-blue-300' :
                    insight.type === 'tip' ? 'text-purple-700 dark:text-purple-300' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    💡 {insight.recommendation}
                  </AlertDescription>
                )}
              </div>
            </div>
          </Alert>
        </motion.div>
      ))}
    </motion.div>
  );
}
