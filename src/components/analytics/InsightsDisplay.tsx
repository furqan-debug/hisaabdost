
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Insight } from "@/hooks/useAnalyticsInsights";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface InsightsDisplayProps {
  insights: Insight[];
}

export function InsightsDisplay({ insights }: InsightsDisplayProps) {
  const isMobile = useIsMobile();
  
  if (insights.length === 0) return null;
  
  return (
    <motion.div 
      className="grid gap-2.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {insights.map((insight, index) => (
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
              insight.type === 'success' ? 'bg-[#f0fdf4]/60 border-[#86efac]/40 dark:bg-[#052e16]/60 dark:border-[#22c55e]/30' : 
              insight.type === 'warning' ? 'bg-[#fef2f2]/70 border-[#fecaca]/40 dark:bg-[#450a0a]/70 dark:border-[#ef4444]/30' : 
              insight.type === 'highlight' ? 'bg-[#f8fafc]/60 border-[#cbd5e1]/40 dark:bg-[#0f172a]/60 dark:border-[#475569]/30' : 
              insight.type === 'tip' ? 'bg-[#eff6ff]/60 border-[#bfdbfe]/40 dark:bg-[#172554]/60 dark:border-[#3b82f6]/30' :
              'bg-[#f5f5f4]/60 border-[#d6d3d1]/40 dark:bg-[#1c1917]/60 dark:border-[#78716c]/30'
            }`}
          >
            <div className="flex gap-2">
              <div className="mt-0.5 flex-shrink-0">{insight.icon}</div>
              <div className="space-y-1 overflow-hidden">
                <AlertDescription className={`font-medium text-${isMobile ? 'xs' : 'sm'} leading-snug`}>
                  {insight.message}
                </AlertDescription>
                {insight.recommendation && (
                  <AlertDescription className={`text-xs text-muted-foreground ${isMobile ? 'line-clamp-2' : ''}`}>
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
