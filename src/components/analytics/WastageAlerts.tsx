
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
      {/* Summary Card */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Wastage Alerts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Expenses that could be reduced for better savings
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {formatAmount(totalWastage)}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Impact</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatAmount(yearlyWastage)}
              </p>
              <p className="text-sm text-muted-foreground">Yearly Potential Loss</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Alerts */}
      <div className="space-y-3">
        {allAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Alert className={`
              ${alert.severity === 'high' ? 'border-red-200 bg-red-50/30' : 
                alert.severity === 'medium' ? 'border-orange-200 bg-orange-50/30' : 
                'border-yellow-200 bg-yellow-50/30'}
            `}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className={`h-4 w-4 ${
                      alert.severity === 'high' ? 'text-red-500' : 
                      alert.severity === 'medium' ? 'text-orange-500' : 
                      'text-yellow-500'
                    }`} />
                    <h4 className="font-semibold">{alert.title}</h4>
                    <Badge variant={
                      alert.severity === 'high' ? 'destructive' : 
                      alert.severity === 'medium' ? 'default' : 
                      'secondary'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                  <AlertDescription className="mb-3">
                    {alert.description}
                  </AlertDescription>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="font-medium">Monthly Impact:</p>
                      <p className="text-lg font-bold">{formatAmount(alert.monthlyImpact)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Yearly Potential:</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatAmount(alert.yearlyImpact)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">Smart Suggestion:</span>
                    </div>
                    <p className="text-sm text-green-800">{alert.suggestion}</p>
                  </div>
                  
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-primary hover:underline">
                      View {alert.frequency} related expenses
                    </summary>
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {alert.expenses.slice(0, 5).map((expense, idx) => (
                        <div key={idx} className="flex justify-between py-1 px-2 bg-muted/30 rounded text-xs">
                          <span className="truncate">{expense.description}</span>
                          <span className="font-medium ml-2">{formatAmount(expense.amount)}</span>
                        </div>
                      ))}
                      {alert.expenses.length > 5 && (
                        <p className="text-xs text-muted-foreground px-2">
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
