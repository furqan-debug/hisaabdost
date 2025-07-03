
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { updateExpenseCache } from "@/utils/expenseCacheUtils";
import { Expense } from "@/components/expenses/types";

export function useExpenseDelete() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteExpense = async (expenseId: string) => {
    if (!user) return false;

    setIsDeleting(true);
    try {
      // Get the expense data before deleting for cache update
      const { data: expenseData, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      // Convert to Expense format for cache update
      const expense: Expense = {
        id: expenseData.id,
        amount: Number(expenseData.amount),
        description: expenseData.description,
        date: expenseData.date,
        category: expenseData.category,
        paymentMethod: expenseData.payment || undefined,
        notes: expenseData.notes || undefined,
        isRecurring: expenseData.is_recurring || false,
        receiptUrl: expenseData.receipt_url || undefined,
      };

      // Direct cache update instead of invalidation
      console.log("Updating expense cache after delete");
      updateExpenseCache({
        queryClient,
        userId: user.id,
        expense,
        operation: 'delete'
      });

      toast({
        title: "Expense Deleted",
        description: "Expense has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteMultipleExpenses = async (expenseIds: string[]) => {
    if (!user || expenseIds.length === 0) return false;

    setIsDeleting(true);
    try {
      // Get expense data before deleting for cache updates
      const { data: expenses, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .in('id', expenseIds);

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('expenses')
        .delete()
        .in('id', expenseIds);

      if (error) throw error;

      // Update cache for each deleted expense
      expenses.forEach(expenseData => {
        const expense: Expense = {
          id: expenseData.id,
          amount: Number(expenseData.amount),
          description: expenseData.description,
          date: expenseData.date,
          category: expenseData.category,
          paymentMethod: expenseData.payment || undefined,
          notes: expenseData.notes || undefined,
          isRecurring: expenseData.is_recurring || false,
          receiptUrl: expenseData.receipt_url || undefined,
        };

        updateExpenseCache({
          queryClient,
          userId: user.id,
          expense,
          operation: 'delete'
        });
      });

      toast({
        title: "Expenses Deleted",
        description: `${expenseIds.length} expenses have been deleted successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Error deleting multiple expenses:', error);
      toast({
        title: "Error",
        description: "Failed to delete the expenses. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteExpense,
    deleteMultipleExpenses,
    isDeleting,
  };
}
