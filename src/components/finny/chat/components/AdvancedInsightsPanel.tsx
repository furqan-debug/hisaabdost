
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdvancedInsightsPanelProps {
  insights?: {
    savingsRate: string;
    topSpendingCategory: string;
    monthlySpending: number;
    financialHealthScore: string;
  };
  isVisible: boolean;
}

export const AdvancedInsightsPanel: React.FC<AdvancedInsightsPanelProps> = ({
  insights,
  isVisible
}) => {
  if (!isVisible || !insights) return null;

  const getHealthColor = (score: string) => {
    switch (score) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      default: return 'bg-orange-500';
    }
  };

  const getHealthIcon = (score: string) => {
    switch (score) {
      case 'Excellent': return <TrendingUp className="w-3 h-3" />;
      case 'Good': return <Target className="w-3 h-3" />;
      default: return <TrendingDown className="w-3 h-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-4"
    >
      <Card className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Savings Rate</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {insights.savingsRate}%
                </span>
                {parseFloat(insights.savingsRate) > 20 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-orange-600" />
                )}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Health Score</p>
              <Badge className={`${getHealthColor(insights.financialHealthScore)} text-white text-xs`}>
                {getHealthIcon(insights.financialHealthScore)}
                <span className="ml-1">{insights.financialHealthScore}</span>
              </Badge>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Top Category</p>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {insights.topSpendingCategory}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
