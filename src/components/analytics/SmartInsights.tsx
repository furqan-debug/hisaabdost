
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
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
      {/* Savings Potential Overview */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            Savings Potential
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Smart insights to optimize your spending
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">
                {formatAmount(savingsImpact.monthlyPotential)}
              </p>
              <p className="text-xs text-muted-foreground">Monthly Potential</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">
                {formatAmount(savingsImpact.yearlyPotential)}
              </p>
              <p className="text-xs text-muted-foreground">Yearly Potential</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600">
                {formatAmount(savingsImpact.easyWins)}
              </p>
              <p className="text-xs text-muted-foreground">Easy Wins</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-purple-600">
                {formatAmount(savingsImpact.longTermSavings)}
              </p>
              <p className="text-xs text-muted-foreground">Long-term</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Insights */}
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTimeframeIcon(insight.timeframe)}</span>
                    <h4 className="font-semibold">{insight.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(insight.difficulty)}>
                      {insight.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {insight.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {insight.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Spending:</p>
                    <p className="font-bold text-lg">{formatAmount(insight.currentSpending)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Potential Savings:</p>
                    <p className="font-bold text-lg text-green-600">
                      {formatAmount(insight.potentialSavings)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-700">Action Steps:</span>
                  </div>
                  <ul className="space-y-1">
                    {insight.actionSteps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Impact timeframe: {insight.timeframe.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Yearly savings: </span>
                    <span className="font-bold text-green-600">
                      {formatAmount(insight.potentialSavings * 12)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Implementation Tip */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Pro Tip</span>
          </div>
          <p className="text-sm text-green-700">
            Start with the "easy" difficulty insights first. Small changes compound over time, 
            and early wins will motivate you to tackle the bigger optimizations!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
