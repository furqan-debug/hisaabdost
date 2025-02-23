
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { format } from "date-fns";
import { CheckSquare, Pencil, Square, Trash2 } from "lucide-react";
import { Expense } from "@/components/AddExpenseSheet";

interface ExpenseRowProps {
  expense: Expense;
  selectedExpenses: Set<string>;
  toggleExpenseSelection: (id: string) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseRow({
  expense,
  selectedExpenses,
  toggleExpenseSelection,
  onEdit,
  onDelete,
}: ExpenseRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleExpenseSelection(expense.id)}
          className="h-8 w-8 p-0"
        >
          {selectedExpenses.has(expense.id) ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
      <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <div>{expense.description}</div>
          {expense.isRecurring && (
            <div className="text-xs text-muted-foreground">
              Recurring
            </div>
          )}
          {expense.notes && (
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {expense.notes}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span 
          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
          style={{ 
            backgroundColor: `${CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS]}20`,
            color: CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS]
          }}
        >
          {expense.category}
        </span>
      </TableCell>
      <TableCell>
        {expense.paymentMethod || 'Cash'}
      </TableCell>
      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(expense)}
          className="h-8 w-8 p-0 mr-2"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(expense.id)}
          className="h-8 w-8 p-0 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
