
import React from 'react';
import { format as formatDate } from 'date-fns';
import { IconButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Receipt } from "lucide-react";
import { Expense } from "./types";
import { cn } from "@/lib/utils";
import { useFormattedCurrency } from "@/hooks/use-formatted-currency";

interface ExpenseRowProps {
  expense: Expense;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onViewReceipt?: (receiptUrl: string) => void;
}

export function ExpenseRow({
  expense,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onViewReceipt
}: ExpenseRowProps) {
  const { format } = useFormattedCurrency();
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food': return 'bg-green-500';
      case 'transportation': return 'bg-blue-500';
      case 'housing': return 'bg-purple-500';
      case 'utilities': return 'bg-yellow-500';
      case 'entertainment': return 'bg-pink-500';
      case 'healthcare': return 'bg-red-500';
      case 'personal': return 'bg-indigo-500';
      case 'education': return 'bg-cyan-500';
      case 'shopping': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(expense.id);
    }
  };

  const formattedDate = expense.date 
    ? formatDate(new Date(expense.date), 'MMM d, yyyy')
    : 'Unknown date';

  const hasReceipt = !!expense.receiptUrl;

  return (
    <tr className={cn(
      "border-b hover:bg-muted/40 transition-colors group",
      isSelected && "bg-primary/10"
    )}>
      <td className="p-2">
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={handleSelect}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </td>
      <td className="p-2 pl-0">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-5 rounded-full ${getCategoryColor(expense.category)}`} />
          <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">
            {expense.description}
          </span>
        </div>
      </td>
      <td className="p-2 whitespace-nowrap">{formattedDate}</td>
      <td className="p-2">
        <Badge variant="outline" className="bg-muted/40">
          {expense.category}
        </Badge>
      </td>
      <td className="p-2 text-right font-medium">
        {format(expense.amount)}
      </td>
      <td className="p-2">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasReceipt && (
            <IconButton 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => onViewReceipt?.(expense.receiptUrl as string)}
              aria-label="View receipt"
            >
              <Receipt className="h-4 w-4" />
            </IconButton>
          )}
          
          <IconButton 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => onEdit?.(expense)}
            aria-label="Edit expense"
          >
            <Edit className="h-4 w-4" />
          </IconButton>
          
          <IconButton 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => onDelete?.(expense.id)}
            aria-label="Delete expense"
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}
