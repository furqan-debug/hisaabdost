import { format } from 'date-fns';
import { Calendar, User, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loan } from '@/hooks/useLoans';
import { formatCurrency } from '@/utils/formatters';
import { useCurrency } from '@/hooks/use-currency';
import { getCurrencyByCode } from '@/utils/currencyUtils';

interface LoanCardProps {
  loan: Loan;
  onAddPayment: (loan: Loan) => void;
  onViewDetails: (loan: Loan) => void;
}

export default function LoanCard({
  loan,
  onAddPayment,
  onViewDetails,
}: LoanCardProps) {
  const { currencyCode } = useCurrency();
  const isGave = loan.loan_type === 'i_gave';
  const progressPercentage = ((loan.amount - loan.remaining_amount) / loan.amount) * 100;
  
  const getStatusBadge = () => {
    if (loan.status === 'fully_paid') {
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Fully Paid</Badge>;
    }
    if (loan.status === 'partially_paid') {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Partially Paid</Badge>;
    }
    if (loan.due_date && new Date(loan.due_date) < new Date()) {
      return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">Overdue</Badge>;
    }
    return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Active</Badge>;
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isGave ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
      }`}
      onClick={() => onViewDetails(loan)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${isGave ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {isGave ? (
              <TrendingUp className={`h-4 w-4 text-green-600`} />
            ) : (
              <TrendingDown className={`h-4 w-4 text-red-600`} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <p className="font-medium">{loan.person_name}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {isGave ? "You'll receive" : 'You owe'}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-semibold">{formatCurrency(loan.amount, currencyCode)}</span>
        </div>
        
        {loan.remaining_amount < loan.amount && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid:</span>
              <span className="text-green-600">
                {formatCurrency(loan.amount - loan.remaining_amount, currencyCode)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining:</span>
              <span className={isGave ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(loan.remaining_amount, currencyCode)}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progressPercentage.toFixed(0)}% repaid
            </p>
          </>
        )}

        {loan.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Due: {format(new Date(loan.due_date), 'MMM dd, yyyy')}</span>
          </div>
        )}
      </div>

      {loan.status !== 'fully_paid' && (
        <Button
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onAddPayment(loan);
          }}
        >
          Add Payment
        </Button>
      )}
    </Card>
  );
}
