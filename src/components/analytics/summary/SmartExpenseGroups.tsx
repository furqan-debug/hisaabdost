import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Package, DollarSign } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";
interface SmartExpenseGroupsProps {
  groups: any[];
  totalSpending: number;
}
export function SmartExpenseGroups({
  groups,
  totalSpending
}: SmartExpenseGroupsProps) {
  const {
    currencyCode
  } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);
  if (groups.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Smart Expense Groups
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Similar expenses grouped together, even with different descriptions
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No similar expense patterns found</p>
            <p className="text-sm">Add more diverse expenses to see groupings</p>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
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
        {groups.map((group, index) => <motion.div key={group.id} initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }} className="border rounded-lg p-4 space-y-3">
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
                  {(group.totalAmount / totalSpending * 100).toFixed(1)}% of total
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm px-0 mx-0">
                <span className="text-muted-foreground">Top expense:</span>
                <span className="font-medium">{formatAmount(group.topExpense.amount)}</span>
              </div>
              <p className="text-sm bg-muted/50 rounded p-2">
                "{group.topExpense.description}" on {group.topExpense.date}
              </p>
              
              {group.expenses.length > 4 && <div className="bg-blue-50/50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Smart Insight:</strong> You spend {formatAmount(group.totalAmount * 12)} yearly on {group.groupName.toLowerCase()}. 
                    {group.totalAmount > 2000 ? ' Consider if all of these are necessary.' : ' This seems well-controlled.'}
                  </p>
                </div>}
            </div>
            
            <details className="text-sm">
              <summary className="cursor-pointer text-primary hover:underline">
                View all {group.expenses.length} expenses
              </summary>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {group.expenses.map((expense, idx) => <div key={idx} className="flex justify-between py-1 px-2 bg-muted/30 rounded">
                    <span className="truncate">{expense.description}</span>
                    <span className="font-medium ml-2">{formatAmount(expense.amount)}</span>
                  </div>)}
              </div>
            </details>
          </motion.div>)}
      </CardContent>
    </Card>;
}