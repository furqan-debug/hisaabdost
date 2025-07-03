
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ExpenseFormData, UseExpenseFormProps } from "./types";
import { Expense } from "@/components/expenses/types";
import { saveExpenseOffline } from "@/services/offlineExpenseService";
import { updateExpenseCache } from "@/utils/expenseCacheUtils";

interface UseExpenseSubmitProps extends UseExpenseFormProps {
  formData: ExpenseFormData;
  resetForm: () => void;
}

export function useExpenseSubmit({ 
  expenseToEdit, 
  onClose, 
  formData, 
  resetForm,
  onAddExpense 
}: UseExpenseSubmitProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.date || !formData.category) return;

    setIsSubmitting(true);
    try {
      if (expenseToEdit) {
        // For editing, we still need online connection
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to edit expenses.",
            variant: "destructive",
          });
          return;
        }

        const expenseData = {
          user_id: user.id,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          category: formData.category,
          payment: formData.paymentMethod,
          notes: formData.notes,
          is_recurring: formData.isRecurring,
          receipt_url: formData.receiptUrl
        };

        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expenseToEdit.id);

        if (error) throw error;

        const updatedExpense: Expense = {
          ...expenseToEdit,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          category: formData.category,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          isRecurring: formData.isRecurring,
          receiptUrl: formData.receiptUrl
        };

        // Direct cache update instead of invalidation
        console.log("Updating expense cache after edit");
        updateExpenseCache({
          queryClient,
          userId: user.id,
          expense: updatedExpense,
          operation: 'update'
        });

        if (onAddExpense) {
          onAddExpense(updatedExpense);
        }

        toast({
          title: "Expense Updated",
          description: "Your expense has been updated successfully.",
        });

        // Temporary fix: Force page reload after expense update to prevent UI freeze
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } else {
        // For new expenses, use offline-capable service
        const newExpense: Expense = {
          id: `temp_${Date.now()}`,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          category: formData.category,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes || "",
          isRecurring: formData.isRecurring,
          receiptUrl: formData.receiptUrl || ""
        };

        const success = await saveExpenseOffline(newExpense);
        
        if (success && user) {
          // Direct cache update instead of invalidation
          console.log("Updating expense cache after new expense");
          updateExpenseCache({
            queryClient,
            userId: user.id,
            expense: newExpense,
            operation: 'add'
          });

          if (onAddExpense) {
            onAddExpense(newExpense);
          }
        } else {
          throw new Error('Failed to save expense');
        }
      }

      resetForm();
      onClose?.();

    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: "Failed to save the expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    isSubmitting,
    handleSubmit 
  };
}
