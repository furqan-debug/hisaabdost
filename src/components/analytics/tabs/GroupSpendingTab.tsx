
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Package, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";
import { analyzeGroupSpending } from "@/utils/groupSpendingAnalyzer";
import { useMemo } from "react";

interface GroupSpendingTabProps {
  expenses: any[];
}

export function GroupSpendingTab({ expenses }: GroupSpendingTabProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);
  
  const groupAnalysis = useMemo(() => analyzeGroupSpending(expenses), [expenses]);
  
  if (groupAnalysis.groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Group Spending Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Intelligent grouping of similar expenses with insights and warnings
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No expense groups found</p>
            <p className="text-sm">Add more expenses to see intelligent groupings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Groups</span>
            </div>
            <p className="text-2xl font-bold mt-1">{groupAnalysis.groups.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Spending</span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatAmount(groupAnalysis.totalSpending)}</p>
          </CardContent>
        </Card>
        
        {groupAnalysis.harmfulSpending > 0 && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Harmful Spending</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-red-700">{formatAmount(groupAnalysis.harmfulSpending)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupAnalysis.groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full ${group.isHarmful ? 'border-red-300 bg-red-50/30' : 'hover:shadow-md'} transition-all duration-200`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${group.isHarmful ? 'text-red-800' : ''}`}>
                    {group.isHarmful && '⚠️ '}{group.name}
                  </CardTitle>
                  <Badge variant={group.isHarmful ? "destructive" : "secondary"}>
                    {group.itemCount} items
                  </Badge>
                </div>
                {group.isHarmful && (
                  <p className="text-sm text-red-600 font-medium">
                    Harmful Category - Consider Reducing!
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Amount and Percentage */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                    <span className={`font-bold text-lg ${group.isHarmful ? 'text-red-700' : 'text-primary'}`}>
                      {formatAmount(group.totalAmount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">% of Total</span>
                    <Badge variant="outline" className={group.isHarmful ? 'text-red-600 border-red-300' : ''}>
                      {group.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Yearly Projection */}
                <div className={`p-3 rounded-lg ${group.isHarmful ? 'bg-red-100 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className={`h-4 w-4 ${group.isHarmful ? 'text-red-600' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${group.isHarmful ? 'text-red-800' : 'text-blue-800'}`}>
                      Yearly Projection
                    </span>
                  </div>
                  <p className={`font-bold ${group.isHarmful ? 'text-red-700' : 'text-blue-700'}`}>
                    {formatAmount(group.yearlyProjection)}
                  </p>
                  {group.isHarmful && (
                    <p className="text-xs text-red-600 mt-1">
                      Think twice before the next purchase! 🚫
                    </p>
                  )}
                </div>

                {/* Smart Suggestions */}
                {group.suggestions && group.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700">Smart Tips</span>
                    </div>
                    <div className="space-y-1">
                      {group.suggestions.slice(0, 2).map((suggestion, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground bg-amber-50 p-2 rounded border border-amber-200">
                          💡 {suggestion}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expense Details */}
                <details className="text-sm">
                  <summary className="cursor-pointer text-primary hover:underline font-medium">
                    View {group.itemCount} expenses
                  </summary>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {group.expenses.slice(0, 5).map((expense, idx) => (
                      <div key={idx} className="flex justify-between py-1 px-2 bg-muted/30 rounded text-xs">
                        <span className="truncate">{expense.description}</span>
                        <span className="font-medium ml-2">{formatAmount(expense.amount)}</span>
                      </div>
                    ))}
                    {group.expenses.length > 5 && (
                      <p className="text-center text-muted-foreground text-xs py-1">
                        ...and {group.expenses.length - 5} more
                      </p>
                    )}
                  </div>
                </details>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
