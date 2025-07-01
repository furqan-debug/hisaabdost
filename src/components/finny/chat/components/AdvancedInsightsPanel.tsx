
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Lightbulb } from 'lucide-react';
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
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            Advanced Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Savings Rate</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{insights.savingsRate}%</span>
                {parseFloat(insights.savingsRate) > 20 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-orange-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Financial Health</p>
              <Badge className={`${getHealthColor(insights.financialHealthScore)} text-white text-xs`}>
                {getHealthIcon(insights.financialHealthScore)}
                <span className="ml-1">{insights.financialHealthScore}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Top Spending Category</p>
            <span className="text-sm font-medium">{insights.topSpendingCategory}</span>
          </div>
          
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              💡 Finny is analyzing your patterns to provide personalized advice
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
