
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Expense } from '@/components/expenses/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { 
  MoreVertical,
  Receipt,
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { EmptyState } from '@/components/EmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  isNewUser?: boolean;
}

export function ExpenseList({
  expenses,
  isLoading,
  onAddExpense,
  onEditExpense,
  isNewUser = false
}: ExpenseListProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(expenses);
  
  // Filter expenses based on search term
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setFilteredExpenses(expenses);
      return;
    }
    
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    const filtered = expenses.filter(expense => {
      return (
        expense.description.toLowerCase().includes(lowercasedTerm) ||
        expense.category.toLowerCase().includes(lowercasedTerm) ||
        (expense.paymentMethod && expense.paymentMethod.toLowerCase().includes(lowercasedTerm))
      );
    });
    
    setFilteredExpenses(filtered);
  }, [debouncedSearchTerm, expenses]);

  // Calculate total amount
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const handleViewAll = () => {
    navigate('/app/expenses');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render empty state
  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No expenses yet"
            description="Start tracking your spending by adding your first expense"
            onAction={onAddExpense}
            actionLabel="Add Expense"
          />
        </CardContent>
      </Card>
    );
  }
  
  // Render expenses list
  return (
    <Card>
      <CardHeader className="pb-0 space-y-0">
        <div className="flex justify-between items-center mb-2">
          <CardTitle>Recent Expenses</CardTitle>
          <span className="text-xl font-bold">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <div className="flex items-center gap-2 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={onAddExpense}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="px-4 py-2">
            {filteredExpenses.slice(0, 10).map((expense, index) => (
              <React.Fragment key={expense.id}>
                <div className="py-3 flex items-center justify-between group">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-medium text-foreground truncate">
                      {expense.description}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                      <Badge variant="outline" className="bg-primary/5">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-right whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditExpense(expense)}>
                          Edit
                        </DropdownMenuItem>
                        {expense.receiptUrl && (
                          <DropdownMenuItem onClick={() => window.open(expense.receiptUrl, '_blank')}>
                            <Receipt className="mr-2 h-4 w-4" />
                            View Receipt
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {index < filteredExpenses.length - 1 && index < 9 && <Separator />}
              </React.Fragment>
            ))}
            
            {filteredExpenses.length > 10 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={handleViewAll} className="w-full">
                  View All Expenses <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
