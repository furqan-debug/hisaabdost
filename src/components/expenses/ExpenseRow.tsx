
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { CATEGORY_COLORS, formatCurrency } from "@/utils/chartUtils";
import { format } from "date-fns";
import { CheckSquare, Eye, MoreVertical, Pencil, Square, Trash2 } from "lucide-react";
import { Expense } from "@/components/AddExpenseSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
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
  onDelete,
}: ExpenseRowProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <TableRow className="animate-fade-in">
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
          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition-colors"
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-scale-in">
            <DropdownMenuItem onClick={() => onEdit(expense)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {expense.receiptUrl && (
              <>
                <DropdownMenuItem onClick={() => setShowReceipt(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Receipt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="animate-scale-in">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this expense? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(expense.id);
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ViewReceiptDialog
          open={showReceipt}
          onOpenChange={setShowReceipt}
          receiptUrl={expense.receiptUrl}
        />
      </TableCell>
    </TableRow>
  );
}
