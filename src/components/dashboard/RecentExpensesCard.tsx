import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, FileImage } from "lucide-react";
import { Expense } from "@/components/AddExpenseSheet";
import { EmptyState } from "@/components/EmptyState";
import { SampleDataButton } from "@/components/SampleDataButton";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency } from "@/hooks/use-currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewReceiptDialog } from "@/components/expenses/ViewReceiptDialog";

interface RecentExpensesCardProps {
  expenses: Expense[];
  isNewUser: boolean;
  isLoading: boolean;
  setExpenseToEdit: (expense: Expense) => void;
  setShowAddExpense: (show: boolean) => void;
}

export const RecentExpensesCard = ({
  expenses,
  isNewUser,
  isLoading,
  setExpenseToEdit,
  setShowAddExpense,
}: RecentExpensesCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const [viewReceiptData, setViewReceiptData] = useState<{ url: string, open: boolean } | null>(null);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      toast({
        title: "Expense Deleted",
        description: "Expense has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewReceipt = (receiptUrl: string) => {
    setViewReceiptData({
      url: receiptUrl,
      open: true
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        ) : isNewUser ? (
          <div className="space-y-4">
            <EmptyState
              title="No expenses yet"
              description="Start tracking your spending by adding your first expense."
              onAction={() => setShowAddExpense(true)}
            />
            <SampleDataButton onApply={async (sampleExpenses) => {
              if (!user) return;
              
              try {
                const formattedExpenses = sampleExpenses.map(exp => ({
                  user_id: user.id,
                  amount: exp.amount,
                  description: exp.description,
                  date: exp.date,
                  category: exp.category,
                }));
                
                const { error } = await supabase
                  .from('expenses')
                  .insert(formattedExpenses);
                
                if (error) throw error;
                
                await queryClient.invalidateQueries({ queryKey: ['expenses'] });
                
                toast({
                  title: "Sample Data Added",
                  description: "Sample expenses have been added successfully.",
                });
              } catch (error) {
                console.error('Error adding sample data:', error);
                toast({
                  title: "Error",
                  description: "Failed to add sample data. Please try again.",
                  variant: "destructive",
                });
              }
            }} />
          </div>
        ) : (
          <div className="-mx-2 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right w-[90px]">Amount</TableHead>
                  <TableHead className="text-right w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.slice(0, 5).map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate">{expense.description}</span>
                        <span className="text-xs text-muted-foreground truncate">{expense.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount, currencyCode)}</TableCell>
                    <TableCell className="text-right p-0 pr-2 md:p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 ml-auto"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {expense.receiptUrl && (
                            <DropdownMenuItem
                              onClick={() => handleViewReceipt(expense.receiptUrl as string)}
                            >
                              <FileImage className="mr-2 h-4 w-4" />
                              <span>View Receipt</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setExpenseToEdit(expense);
                              setShowAddExpense(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Receipt Viewer Dialog */}
        {viewReceiptData && (
          <ViewReceiptDialog
            receiptUrl={viewReceiptData.url}
            open={viewReceiptData.open}
            onOpenChange={(open) => setViewReceiptData(prev => prev ? {...prev, open} : null)}
          />
        )}
      </CardContent>
    </Card>
  );
};
