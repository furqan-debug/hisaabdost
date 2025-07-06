
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface SmartExpenseGroupsProps {
  groups: any[];
  totalSpending: number;
}

export function SmartExpenseGroups({ groups, totalSpending }: SmartExpenseGroupsProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);

  if (groups.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            Smart Expense Groups
          </CardTitle>
          <p className="text-sm text-muted-foreground ml-10">
            Similar expenses grouped together automatically
          </p>
        </CardHeader>
        <CardContent className="ml-10">
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">No expense groups found</p>
            <p className="text-sm">Add more expenses to see smart groupings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          Smart Expense Groups
        </CardTitle>
        <p className="text-sm text-muted-foreground ml-10">
          {groups.length} groups of similar expenses found
        </p>
      </CardHeader>
      <CardContent className="ml-10 space-y-4">
        {groups.slice(0, 5).map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-background to-muted/20 rounded-xl p-5 border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <div>
                  <h4 className="font-semibold text-base">{group.groupName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {group.expenses.length} similar expenses
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">{formatAmount(group.totalAmount)}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {((group.totalAmount / totalSpending) * 100).toFixed(1)}% of total
                </Badge>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 mb-3">
              <p className="text-sm font-medium mb-1">Top expense:</p>
              <p className="text-sm text-muted-foreground">
                "{group.topExpense.description}" - {formatAmount(group.topExpense.amount)}
              </p>
            </div>
            
            {group.totalAmount > 2000 && (
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-3 dark:bg-amber-950/20 dark:border-amber-800/30">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  💡 <strong>Yearly Impact:</strong> This category costs you approximately {formatAmount(group.totalAmount * 12)} per year
                </p>
              </div>
            )}
          </motion.div>
        ))}
        
        {groups.length > 5 && (
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              + {groups.length - 5} more groups available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
