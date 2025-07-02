
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ExpenseFormData, UseExpenseFormProps } from "./types";
import { Expense } from "@/components/expenses/types";
import { saveExpenseOffline } from "@/services/offlineExpenseService";

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

        await queryClient.invalidateQueries({ queryKey: ['expenses'] });
        await queryClient.invalidateQueries({ queryKey: ['budgets'] });

        // Dispatch single event for expense update
        window.dispatchEvent(new CustomEvent('expense-updated', {
          detail: { 
            expense: updatedExpense,
            source: 'expense-form'
          }
        }));

        if (onAddExpense) {
          onAddExpense(updatedExpense);
        }

        toast({
          title: "Expense Updated",
          description: "Your expense has been updated successfully.",
        });
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
        
        if (success) {
          // Invalidate queries to refresh data
          await queryClient.invalidateQueries({ queryKey: ['expenses'] });
          await queryClient.invalidateQueries({ queryKey: ['budgets'] });

          if (onAddExpense) {
            onAddExpense(newExpense);
          }

          // Don't show additional toast here as saveExpenseOffline already shows one
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
