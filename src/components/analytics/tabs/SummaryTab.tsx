import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { groupSimilarExpenses, getTopSpenders, analyzeSpendingPatterns } from "@/utils/expenseGrouping";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Target } from "lucide-react";
import { WastageAlerts } from "../WastageAlerts";
import { SmartInsights } from "../SmartInsights";

interface SummaryTabProps {
  expenses: any[];
}

export function SummaryTab({ expenses }: SummaryTabProps) {
  const { currencyCode } = useCurrency();
  
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);
  
  const groupingResult = groupSimilarExpenses(expenses);
  const topSpenders = getTopSpenders(expenses, 5);
  const spendingPatterns = analyzeSpendingPatterns(expenses);
  
  const totalSpending = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const groupedPercentage = (groupingResult.totalGrouped / totalSpending) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Smart Groups</p>
                <p className="text-2xl font-bold">{groupingResult.groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Grouped Spending</p>
                <p className="text-2xl font-bold">{formatAmount(groupingResult.totalGrouped)}</p>
                <p className="text-xs text-green-600">{groupedPercentage.toFixed(1)}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Patterns Found</p>
                <p className="text-2xl font-bold">{spendingPatterns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wastage Alerts Section */}
      <WastageAlerts expenses={expenses} />

      {/* Smart Savings Insights */}
      <SmartInsights expenses={expenses} totalSpending={totalSpending} />

      {/* Smart Expense Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Smart Expense Groups
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Similar expenses grouped together, even with different descriptions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {groupingResult.groups.length > 0 ? (
            groupingResult.groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div>
                      <h4 className="font-semibold">{group.groupName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {group.expenses.length} similar expenses
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatAmount(group.totalAmount)}</p>
                    <Badge variant="secondary" className="text-xs">
                      {((group.totalAmount / totalSpending) * 100).toFixed(1)}% of total
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Top expense:</span>
                    <span className="font-medium">{formatAmount(group.topExpense.amount)}</span>
                  </div>
                  <p className="text-sm bg-muted/50 rounded p-2">
                    "{group.topExpense.description}" on {group.topExpense.date}
                  </p>
                  
                  {/* Smart Insight for this group */}
                  {group.expenses.length > 4 && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded p-2">
                      <p className="text-xs text-blue-700">
                        💡 <strong>Smart Insight:</strong> You spend {formatAmount(group.totalAmount * 12)} yearly on {group.groupName.toLowerCase()}. 
                        {group.totalAmount > 2000 ? ' Consider if all of these are necessary.' : ' This seems well-controlled.'}
                      </p>
                    </div>
                  )}
                </div>
                
                <details className="text-sm">
                  <summary className="cursor-pointer text-primary hover:underline">
                    View all {group.expenses.length} expenses
                  </summary>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {group.expenses.map((expense, idx) => (
                      <div key={idx} className="flex justify-between py-1 px-2 bg-muted/30 rounded">
                        <span className="truncate">{expense.description}</span>
                        <span className="font-medium ml-2">{formatAmount(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No similar expense patterns found</p>
              <p className="text-sm">Add more diverse expenses to see groupings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Individual Spenders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Individual Expenses
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your biggest single expenses this period
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topSpenders.map((expense, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-background to-muted/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[200px]">
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{expense.date}</span>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatAmount(expense.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.percentage.toFixed(1)}% of total
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spending Patterns Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Spending Pattern Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Insights from your spending behavior
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spendingPatterns.map((pattern, index) => (
              <motion.div
                key={pattern.pattern}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">
                    {pattern.pattern.replace('_', ' & ')}
                  </h4>
                  <Badge variant={pattern.count > 3 ? "default" : "secondary"}>
                    {pattern.count} expenses
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total spent:</span>
                    <span className="font-medium">{formatAmount(pattern.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average per expense:</span>
                    <span className="font-medium">{formatAmount(pattern.averageAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">% of total spending:</span>
                    <span className="font-medium">
                      {((pattern.totalAmount / totalSpending) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Pattern-specific insights */}
                  {pattern.totalAmount * 12 > 5000 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-xs text-amber-800">
                        💰 This costs you {formatAmount(pattern.totalAmount * 12)} per year
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ungrouped Expenses */}
      {groupingResult.ungrouped.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Individual Expenses
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Unique expenses that don't match any patterns ({groupingResult.ungrouped.length} items)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {groupingResult.ungrouped.map((expense, index) => (
                <div key={index} className="flex justify-between items-center p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm truncate">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{expense.date}</p>
                  </div>
                  <span className="font-medium">{formatAmount(expense.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
