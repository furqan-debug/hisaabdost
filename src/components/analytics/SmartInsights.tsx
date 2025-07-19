
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { generateSavingsInsights, calculateSavingsImpact } from "@/utils/savingsEngine";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface SmartInsightsProps {
  expenses: any[];
  totalSpending: number;
}

export function SmartInsights({ expenses, totalSpending }: SmartInsightsProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);
  
  const insights = generateSavingsInsights(expenses, totalSpending);
  const savingsImpact = calculateSavingsImpact(insights);
  
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Smart Savings Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="text-green-600 font-medium">Excellent spending habits! 👏</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your current spending pattern looks well-optimized
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50';
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50';
      case 'hard': return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/50';
    }
  };
  
  const getTimeframeIcon = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate': return '⚡';
      case 'short_term': return '📅';
      case 'long_term': return '🎯';
      default: return '⏱️';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Savings Potential Overview with enhanced contrast */}
      <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 dark:border-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Savings Potential
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Smart insights to optimize your spending
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {formatAmount(savingsImpact.monthlyPotential)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Monthly Potential</p>
            </div>
            <div className="text-center bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatAmount(savingsImpact.yearlyPotential)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Yearly Potential</p>
            </div>
            <div className="text-center bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatAmount(savingsImpact.easyWins)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Easy Wins</p>
            </div>
            <div className="text-center bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {formatAmount(savingsImpact.longTermSavings)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">Long-term</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Insights with improved contrast */}
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-gray-800/95">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTimeframeIcon(insight.timeframe)}</span>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">{insight.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(insight.difficulty)}>
                      {insight.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      {insight.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {insight.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-600 dark:text-gray-300">Current Spending:</p>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{formatAmount(insight.currentSpending)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-600 dark:text-gray-300">Potential Savings:</p>
                    <p className="font-bold text-lg text-green-700 dark:text-green-300">
                      {formatAmount(insight.potentialSavings)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-3 border border-gray-200 dark:border-gray-500">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">Action Steps:</span>
                  </div>
                  <ul className="space-y-1">
                    {insight.actionSteps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-200">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>Impact timeframe: {insight.timeframe.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Yearly savings: </span>
                    <span className="font-bold text-green-700 dark:text-green-300">
                      {formatAmount(insight.potentialSavings * 12)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Implementation Tip with better contrast */}
      <Card className="border-green-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 dark:border-green-600">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-300">Pro Tip</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-200">
            Start with the "easy" difficulty insights first. Small changes compound over time, 
            and early wins will motivate you to tackle the bigger optimizations!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
