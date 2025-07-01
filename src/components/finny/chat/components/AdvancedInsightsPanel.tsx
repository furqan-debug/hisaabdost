
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Lightbulb, Sparkles } from 'lucide-react';
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
      case 'Excellent': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'Good': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-orange-500 to-amber-500';
    }
  };

  const getHealthIcon = (score: string) => {
    switch (score) {
      case 'Excellent': return <TrendingUp className="w-4 h-4" />;
      case 'Good': return <Target className="w-4 h-4" />;
      default: return <TrendingDown className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className="border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 shadow-lg backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold">
              AI Financial Insights
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Savings Rate</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {insights.savingsRate}%
                </span>
                <div className={`p-1 rounded-full ${parseFloat(insights.savingsRate) > 20 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                  {parseFloat(insights.savingsRate) > 20 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-orange-600" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Financial Health</p>
              <Badge className={`${getHealthColor(insights.financialHealthScore)} text-white text-xs border-0 shadow-md`}>
                {getHealthIcon(insights.financialHealthScore)}
                <span className="ml-1 font-semibold">{insights.financialHealthScore}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Top Spending Category</p>
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {insights.topSpendingCategory}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-violet-400 to-purple-400 flex items-center justify-center">
                <Lightbulb className="w-2 h-2 text-white" />
              </div>
              <span>AI is analyzing your patterns for personalized advice</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
