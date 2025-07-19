
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Target, DollarSign } from "lucide-react";
import { detectWastagePatterns, detectFrequentSmallExpenses } from "@/utils/wastageDetection";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface WastageAlertsProps {
  expenses: any[];
}

export function WastageAlerts({ expenses }: WastageAlertsProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);
  
  const wastageAlerts = detectWastagePatterns(expenses);
  const frequentSmallAlerts = detectFrequentSmallExpenses(expenses);
  const allAlerts = [...wastageAlerts, ...frequentSmallAlerts];
  
  if (allAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Wastage Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="text-green-600 font-medium">Great spending discipline! 🎉</p>
            <p className="text-sm text-muted-foreground mt-2">
              No significant wastage patterns detected in your expenses
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const totalWastage = allAlerts.reduce((sum, alert) => sum + alert.monthlyImpact, 0);
  const yearlyWastage = totalWastage * 12;
  
  return (
    <div className="space-y-4">
      {/* Summary Card with higher contrast */}
      <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 dark:border-orange-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Wastage Alerts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Expenses that could be reduced for better savings
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {formatAmount(totalWastage)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Impact</p>
            </div>
            <div className="text-center bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatAmount(yearlyWastage)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Yearly Potential Loss</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Alerts with improved contrast */}
      <div className="space-y-3">
        {allAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Alert className={`
              ${alert.severity === 'high' ? 
                'border-red-300 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/60 dark:to-red-900/60 dark:border-red-500' : 
                alert.severity === 'medium' ? 
                'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/60 dark:to-orange-900/60 dark:border-orange-500' : 
                'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/60 dark:to-yellow-900/60 dark:border-yellow-500'}
            `}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className={`h-4 w-4 ${
                      alert.severity === 'high' ? 'text-red-600 dark:text-red-400' : 
                      alert.severity === 'medium' ? 'text-orange-600 dark:text-orange-400' : 
                      'text-yellow-600 dark:text-yellow-400'
                    }`} />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">{alert.title}</h4>
                    <Badge variant={
                      alert.severity === 'high' ? 'destructive' : 
                      alert.severity === 'medium' ? 'default' : 
                      'secondary'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                  <AlertDescription className="mb-3 text-gray-700 dark:text-gray-200">
                    {alert.description}
                  </AlertDescription>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                      <p className="font-medium text-gray-600 dark:text-gray-300">Monthly Impact:</p>
                      <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{formatAmount(alert.monthlyImpact)}</p>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                      <p className="font-medium text-gray-600 dark:text-gray-300">Yearly Potential:</p>
                      <p className="text-lg font-bold text-red-700 dark:text-red-300">
                        {formatAmount(alert.yearlyImpact)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 rounded-lg p-3 border border-green-200 dark:border-green-600">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-700 dark:text-green-400" />
                      <span className="font-medium text-green-800 dark:text-green-300">Smart Suggestion:</span>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200">{alert.suggestion}</p>
                  </div>
                  
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-primary hover:underline font-medium">
                      View {alert.frequency} related expenses
                    </summary>
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {alert.expenses.slice(0, 5).map((expense, idx) => (
                        <div key={idx} className="flex justify-between py-1 px-2 bg-white/50 dark:bg-gray-700/50 rounded text-xs">
                          <span className="truncate text-gray-700 dark:text-gray-200">{expense.description}</span>
                          <span className="font-medium ml-2 text-gray-800 dark:text-gray-100">{formatAmount(expense.amount)}</span>
                        </div>
                      ))}
                      {alert.expenses.length > 5 && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 px-2">
                          ...and {alert.expenses.length - 5} more
                        </p>
                      )}
                    </div>
                  </details>
                </div>
              </div>
            </Alert>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
