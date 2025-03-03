
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Ensure category exists in CATEGORY_COLORS, fallback to 'Other'
  const category = CATEGORY_COLORS.hasOwnProperty(expense.category) 
    ? expense.category 
    : 'Other';
  
  const handleDelete = () => {
    onDelete(expense.id);
    setShowDeleteConfirm(false);
    // Ensure expense is removed from selection if it was selected
    if (selectedExpenses.has(expense.id)) {
      toggleExpenseSelection(expense.id);
    }
  };

  if (isMobile) {
    return (
      <TableRow 
        className="animate-fade-in group"
        data-state={selectedExpenses.has(expense.id) ? 'selected' : 'default'}
      >
        <TableCell className="p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => !showDeleteConfirm && toggleExpenseSelection(expense.id)}
            className="h-8 w-8 p-0"
            aria-label={selectedExpenses.has(expense.id) ? "Deselect expense" : "Select expense"}
            disabled={showDeleteConfirm}
          >
            {selectedExpenses.has(expense.id) ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="p-2 w-full">
          <div className="space-y-1">
            <div className="flex justify-between">
              <div className="font-medium">{expense.description}</div>
              <div className="text-right font-medium">{formatCurrency(expense.amount)}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {format(new Date(expense.date), 'MMM dd, yyyy')}
                {expense.isRecurring && <span className="ml-1">• Recurring</span>}
              </div>
              <span 
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors"
                style={{ 
                  backgroundColor: `${CATEGORY_COLORS[category]}20`,
                  color: CATEGORY_COLORS[category]
                }}
              >
                {category}
              </span>
            </div>
            {expense.notes && (
              <div className="text-xs text-muted-foreground truncate" title={expense.notes}>
                {expense.notes}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="p-2 w-[40px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                aria-label="Open expense actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuItem 
                onClick={() => onEdit(expense)}
                disabled={showDeleteConfirm}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {expense.receiptUrl && (
                <>
                  <DropdownMenuItem 
                    onClick={() => setShowReceipt(true)}
                    disabled={showDeleteConfirm}
                  >
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
                  Are you sure you want to delete this {expense.category} expense of {formatCurrency(expense.amount)}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
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
  
  // Return original desktop version
  return (
    <TableRow 
      className="animate-fade-in group"
      data-state={selectedExpenses.has(expense.id) ? 'selected' : 'default'}
    >
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => !showDeleteConfirm && toggleExpenseSelection(expense.id)}
          className="h-8 w-8 p-0"
          aria-label={selectedExpenses.has(expense.id) ? "Deselect expense" : "Select expense"}
          disabled={showDeleteConfirm}
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
          <div className="font-medium">{expense.description}</div>
          {expense.isRecurring && (
            <div className="text-xs text-muted-foreground">
              Recurring
            </div>
          )}
          {expense.notes && (
            <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={expense.notes}>
              {expense.notes}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span 
          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition-colors"
          style={{ 
            backgroundColor: `${CATEGORY_COLORS[category]}20`,
            color: CATEGORY_COLORS[category]
          }}
        >
          {category}
        </span>
      </TableCell>
      <TableCell>
        {expense.paymentMethod || 'Cash'}
      </TableCell>
      <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Open expense actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-scale-in">
            <DropdownMenuItem 
              onClick={() => onEdit(expense)}
              disabled={showDeleteConfirm}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {expense.receiptUrl && (
              <>
                <DropdownMenuItem 
                  onClick={() => setShowReceipt(true)}
                  disabled={showDeleteConfirm}
                >
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
                Are you sure you want to delete this {expense.category} expense of {formatCurrency(expense.amount)}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDelete}
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
