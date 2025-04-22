
import React from 'react';
import { Expense } from '@/components/expenses/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseRow } from '@/components/expenses/ExpenseRow';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/formatters';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
  totalAmount?: number;
}

export function ExpenseList({
  expenses,
  isLoading = false,
  onEdit,
  onDelete,
  onAddNew,
  totalAmount
}: ExpenseListProps) {
  // Group expenses by category
  const groupedByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
  
  // Calculate totals by category
  const categoryTotals = Object.entries(groupedByCategory).map(([category, expenses]) => ({
    category,
    total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    count: expenses.length
  })).sort((a, b) => b.total - a.total);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }
    
    if (expenses.length === 0) {
      return (
        <EmptyState
          title="No expenses yet"
          description="Start tracking your spending by adding your first expense"
          onAction={onAddNew}
          actionLabel="Add Expense"
        />
      );
    }
    
    return (
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="byCategory">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-1">
          <ScrollArea className="max-h-[400px] pr-4 -mr-4">
            {expenses.map((expense, index) => (
              <React.Fragment key={expense.id}>
                <ExpenseRow
                  expense={expense}
                  onEdit={() => onEdit?.(expense)}
                  onDelete={() => onDelete?.(expense.id)}
                />
                {index < expenses.length - 1 && <Separator className="my-1" />}
              </React.Fragment>
            ))}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="byCategory">
          <ScrollArea className="max-h-[400px] pr-4 -mr-4">
            <div className="space-y-4">
              {categoryTotals.map(({ category, total, count }) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <span className="font-medium">{category}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({count} {count === 1 ? 'expense' : 'expenses'})
                      </span>
                    </div>
                    <span className="font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <Separator />
                  {groupedByCategory[category].map((expense, index) => (
                    <React.Fragment key={expense.id}>
                      <ExpenseRow
                        expense={expense}
                        onEdit={() => onEdit?.(expense)}
                        onDelete={() => onDelete?.(expense.id)}
                      />
                      {index < groupedByCategory[category].length - 1 && <Separator className="my-1" />}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Expenses</CardTitle>
          {totalAmount !== undefined && (
            <span className="text-lg font-semibold">{formatCurrency(totalAmount)}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
