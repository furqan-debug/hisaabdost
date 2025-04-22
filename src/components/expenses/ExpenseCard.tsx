
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export interface ExpenseCardProps {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string;
  hasReceipt?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ExpenseCard({
  description,
  amount,
  category,
  date,
  paymentMethod,
  hasReceipt,
  onClick,
  className
}: ExpenseCardProps) {
  const formattedDate = format(new Date(date), 'MMM dd, yyyy');
  
  const renderPaymentMethod = () => {
    if (!paymentMethod) return null;
    
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CreditCard className="w-3 h-3" />
        <span className="capitalize">{paymentMethod}</span>
      </div>
    );
  };
  
  const renderCategoryBadge = () => {
    return (
      <Badge variant="outline" className="font-normal text-xs rounded-sm px-1.5 bg-primary/5">
        {category}
      </Badge>
    );
  };
  
  return (
    <Card 
      className={cn(
        "border group transition-all duration-200 ease-in-out hover:border-primary/20 hover:shadow-sm overflow-hidden",
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1 overflow-hidden flex-1">
            <div className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {description}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {renderCategoryBadge()}
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{formatCurrency(amount)}</div>
            <div className="flex items-center justify-end mt-1 gap-2">
              {renderPaymentMethod()}
              {hasReceipt && <Receipt className="w-3 h-3 text-muted-foreground" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
