
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Expense } from "@/components/AddExpenseSheet";
import { EmptyState } from "@/components/EmptyState";
import { SampleDataButton } from "@/components/SampleDataButton";
import { formatCurrency } from "@/utils/chartUtils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 5).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setExpenseToEdit(expense);
                        setShowAddExpense(true);
                      }}
                      className="h-8 w-8 p-0 mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
