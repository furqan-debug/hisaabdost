import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, FileText, Trash2, Edit, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Loan } from '@/hooks/useLoans';
import { useLoanRepayments } from '@/hooks/useLoanRepayments';
import { useLoanInstallments } from '@/hooks/useLoanInstallments';
import { formatCurrency } from '@/utils/formatters';
import { useCurrency } from '@/hooks/use-currency';
import { getCurrencyByCode } from '@/utils/currencyUtils';
import AddPaymentDialog from './AddPaymentDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteLoan } from '@/hooks/useLoans';

interface LoanDetailsDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoanDetailsDialog({
  loan,
  open,
  onOpenChange,
}: LoanDetailsDialogProps) {
  const { currencyCode } = useCurrency();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: repayments = [] } = useLoanRepayments(loan?.id || '');
  const { data: installments = [] } = useLoanInstallments(loan?.id || '');
  const deleteLoan = useDeleteLoan();

  if (!loan) return null;

  const progressPercentage = ((loan.amount - loan.remaining_amount) / loan.amount) * 100;
  const isGave = loan.loan_type === 'i_gave';

  const handleDelete = () => {
    deleteLoan.mutate(loan.id, {
      onSuccess: () => {
        onOpenChange(false);
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {loan.person_name}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Loan Summary */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline" className={isGave ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>
                      {isGave ? "You'll Receive" : 'You Owe'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="outline">
                      {loan.status === 'fully_paid' ? 'Fully Paid' : loan.status === 'partially_paid' ? 'Partially Paid' : 'Active'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(loan.amount, currencyCode)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className={`text-lg font-semibold ${isGave ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(loan.remaining_amount, currencyCode)}
                    </p>
                  </div>
                </div>

                {loan.remaining_amount < loan.amount && (
                  <div className="space-y-2">
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {formatCurrency(loan.amount - loan.remaining_amount, currencyCode)} paid ({progressPercentage.toFixed(0)}%)
                    </p>
                  </div>
                )}

                {loan.due_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {format(new Date(loan.due_date), 'MMMM dd, yyyy')}</span>
                  </div>
                )}

                {loan.note && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Note</span>
                    </div>
                    <p className="text-sm bg-muted/50 p-3 rounded">{loan.note}</p>
                  </div>
                )}
              </div>

              {/* Installments */}
              {installments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold">Installments</h3>
                    <div className="space-y-2">
                      {installments.map((installment) => (
                        <div key={installment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div>
                            <p className="font-medium">Installment #{installment.installment_number}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {format(new Date(installment.due_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(installment.amount, currencyCode)}</p>
                            <Badge variant="outline" className={installment.status === 'paid' ? 'bg-green-500/10' : ''}>
                              {installment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Repayment History */}
              {repayments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold">Repayment History</h3>
                    <div className="space-y-2">
                      {repayments.map((repayment) => (
                        <div key={repayment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div>
                            <p className="font-medium">{format(new Date(repayment.payment_date), 'MMM dd, yyyy')}</p>
                            {repayment.note && <p className="text-sm text-muted-foreground">{repayment.note}</p>}
                          </div>
                          <p className="font-semibold text-green-600">+{formatCurrency(repayment.amount, currencyCode)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t">
            {loan.status !== 'fully_paid' && (
              <Button onClick={() => setShowPaymentDialog(true)} className="flex-1">
                <DollarSign className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddPaymentDialog
        loan={loan}
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Loan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this loan record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
