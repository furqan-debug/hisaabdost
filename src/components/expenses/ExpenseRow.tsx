
import { format } from 'date-fns';
import { MoreVertical, Pencil, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { Expense } from '@/components/expenses/types';

interface ExpenseRowProps {
  expense: Expense;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ExpenseRow({ expense, onEdit, onDelete }: ExpenseRowProps) {
  const {
    description,
    amount,
    date,
    category,
    paymentMethod,
    receiptUrl,
  } = expense;
  
  const formattedDate = format(new Date(date), 'MMM d, yyyy');
  
  const handleOpenReceipt = () => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };
  
  return (
    <div className="py-2 flex items-center justify-between group">
      <div className="flex-1 min-w-0">
        <div className="flex items-start">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">
              {description}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span>{formattedDate}</span>
              {paymentMethod && (
                <span className="capitalize text-xs">{paymentMethod}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/5">
          {category}
        </Badge>
        <div className="font-semibold text-right min-w-[80px]">
          {formatCurrency(amount)}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {receiptUrl && (
                <DropdownMenuItem onClick={handleOpenReceipt}>
                  <Receipt className="mr-2 h-4 w-4" />
                  View Receipt
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
