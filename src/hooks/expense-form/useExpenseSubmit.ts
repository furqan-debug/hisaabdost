
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ExpenseFormData, UseExpenseFormProps } from "./types";
import { Expense } from "@/components/expenses/types";

interface UseExpenseSubmitProps extends UseExpenseFormProps {
  formData: ExpenseFormData;
  resetForm: () => void;
}

export function useExpenseSubmit({ 
  expenseToEdit, 
  onClose, 
  formData, 
  resetForm 
}: UseExpenseSubmitProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.date || !formData.category || !user) return;

    setIsSubmitting(true);
    try {
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

      let error;
      if (expenseToEdit) {
        const { error: updateError } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expenseToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('expenses')
          .insert([expenseData]);
        error = insertError;
      }

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });

      toast({
        title: expenseToEdit ? "Expense Updated" : "Expense Added",
        description: expenseToEdit 
          ? "Your expense has been updated successfully."
          : "Your expense has been added successfully.",
      });

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
