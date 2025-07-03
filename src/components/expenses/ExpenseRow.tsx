
import { format } from "date-fns";
import { Trash2, FileImage, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Expense } from "@/components/expenses/types";
import { formatCurrency } from "@/utils/formatters";
import { ViewReceiptDialog } from "./ViewReceiptDialog";
import { useState, useCallback, memo } from "react";
import { useCurrency } from "@/hooks/use-currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExpenseRowProps {
  expense: Expense;
  selectedExpenses: Set<string>;
  toggleExpenseSelection: (id: string) => void;
  onDelete: (id: string) => void;
}

// Use memo to prevent unnecessary re-renders of rows
export const ExpenseRow = memo(function ExpenseRow({
  expense,
  selectedExpenses,
  toggleExpenseSelection,
  onDelete
}: ExpenseRowProps) {
  const isSelected = selectedExpenses.has(expense.id);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const { currencyCode } = useCurrency();
  
  const handleViewReceipt = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReceiptDialogOpen(true);
  }, []);
  
  const handleReceiptDialogChange = useCallback((open: boolean) => {
    setReceiptDialogOpen(open);
  }, []);
  
  const handleDelete = useCallback(() => {
    onDelete(expense.id);
  }, [expense.id, onDelete]);
  
  const handleCheckboxChange = useCallback(() => {
    toggleExpenseSelection(expense.id);
  }, [expense.id, toggleExpenseSelection]);
  
  // Check if the expense has a receipt - ensure proper type checking
  const hasReceipt = typeof expense.receiptUrl === 'string' && expense.receiptUrl.trim() !== '';
  
  return (
    <TableRow>
      <TableCell className="w-[30px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
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
          {formatCurrency(expense.amount, currencyCode)}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hasReceipt && (
                <DropdownMenuItem onClick={handleViewReceipt}>
                  <FileImage className="h-4 w-4 mr-2" />
                  View Receipt
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Only render the dialog component when there's a receipt */}
        {hasReceipt && expense.receiptUrl && (
          <ViewReceiptDialog 
            receiptUrl={expense.receiptUrl} 
            open={receiptDialogOpen}
            onOpenChange={handleReceiptDialogChange}
          />
        )}
      </TableCell>
    </TableRow>
  );
});
