
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteFundsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  addition: any;
  isDeleting: boolean;
}

export function DeleteFundsDialog({
  isOpen,
  onClose,
  onDelete,
  addition,
  isDeleting
}: DeleteFundsDialogProps) {
  const { currencyCode } = useCurrency();

  if (!addition) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Added Funds
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this wallet addition? This action cannot be undone.
              </p>
              
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(addition.amount, currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <span className="text-sm font-medium">
                    {addition.description || 'Added funds'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(addition.date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This will reduce your wallet balance by {formatCurrency(addition.amount, currencyCode)}.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
