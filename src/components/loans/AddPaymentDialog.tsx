import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loan } from '@/hooks/useLoans';
import { useAddRepayment } from '@/hooks/useLoanRepayments';
import { formatCurrency } from '@/utils/formatters';
import { useCurrency } from '@/hooks/use-currency';
import { getCurrencyByCode } from '@/utils/currencyUtils';

interface AddPaymentDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPaymentDialog({
  loan,
  open,
  onOpenChange,
}: AddPaymentDialogProps) {
  const { currencyCode } = useCurrency();
  const currencySymbol = getCurrencyByCode(currencyCode).symbol;
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');

  const addRepayment = useAddRepayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loan || !amount || Number(amount) <= 0) return;

    addRepayment.mutate(
      {
        loan_id: loan.id,
        amount: Number(amount),
        payment_date: paymentDate.toISOString().split('T')[0],
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAmount('');
          setPaymentDate(new Date());
          setNote('');
          onOpenChange(false);
        },
      }
    );
  };

  if (!loan) return null;

  const newBalance = loan.remaining_amount - Number(amount || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Balance:</span>
              <span className="font-semibold">{formatCurrency(loan.remaining_amount, currencyCode)}</span>
            </div>
            {amount && Number(amount) > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Amount:</span>
                  <span className="text-green-600">-{formatCurrency(Number(amount), currencyCode)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>New Balance:</span>
                  <span className={newBalance < 0 ? 'text-red-600' : ''}>
                    {formatCurrency(Math.max(0, newBalance), currencyCode)}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max={loan.remaining_amount}
                required
              />
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setAmount(loan.remaining_amount.toString())}
            >
              Pay full amount ({formatCurrency(loan.remaining_amount, currencyCode)})
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !paymentDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => date && setPaymentDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add payment details..."
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addRepayment.isPending || !amount || Number(amount) <= 0 || Number(amount) > loan.remaining_amount} 
              className="flex-1"
            >
              {addRepayment.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
