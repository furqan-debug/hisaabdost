
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Expense } from "@/components/expenses/types";
import { formatCurrency } from "@/utils/chartUtils";
import { ViewReceiptDialog } from "./ViewReceiptDialog";

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
  onDelete
}: ExpenseRowProps) {
  const isSelected = selectedExpenses.has(expense.id);
  
  return (
    <TableRow>
      <TableCell className="w-[30px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleExpenseSelection(expense.id)}
        />
      </TableCell>
      <TableCell className="font-medium">
        {format(new Date(expense.date), "MMM dd, yyyy")}
      </TableCell>
      <TableCell>
        {expense.description}
      </TableCell>
      <TableCell>
        <span className="font-mono">
          {formatCurrency(expense.amount)}
        </span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
          {expense.category}
        </span>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span className="text-muted-foreground">
          {expense.paymentMethod || "N/A"}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 justify-end">
          {expense.receiptUrl && <ViewReceiptDialog receiptUrl={expense.receiptUrl} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(expense)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(expense.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
