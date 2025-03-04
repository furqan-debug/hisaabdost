import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Expense } from "@/components/expenses/types";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ExpenseFormData {
  amount: string;
  description: string;
  date: string;
  category: string;
  paymentMethod: string;
  notes: string;
  isRecurring: boolean;
  receiptFile: File | null;
  receiptUrl: string;
}

interface UseExpenseFormProps {
  expenseToEdit?: Expense;
  onClose?: () => void;
}

export function useExpenseForm({ expenseToEdit, onClose }: UseExpenseFormProps) {
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: expenseToEdit?.amount.toString() || "",
    description: expenseToEdit?.description || "",
    date: expenseToEdit?.date || new Date().toISOString().split('T')[0],
    category: expenseToEdit?.category || "Other",
    paymentMethod: expenseToEdit?.paymentMethod || "Cash",
    notes: expenseToEdit?.notes || "",
    isRecurring: expenseToEdit?.isRecurring || false,
    receiptFile: null,
    receiptUrl: expenseToEdit?.receiptUrl || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when expenseToEdit changes
  useEffect(() => {
    if (expenseToEdit) {
      console.log("Setting expense data from expenseToEdit:", expenseToEdit);
      setFormData({
        amount: expenseToEdit.amount.toString(),
        description: expenseToEdit.description,
        date: expenseToEdit.date,
        category: expenseToEdit.category,
        paymentMethod: expenseToEdit.paymentMethod || "Cash",
        notes: expenseToEdit.notes || "",
        isRecurring: expenseToEdit.isRecurring || false,
        receiptFile: null,
        receiptUrl: expenseToEdit.receiptUrl || "",
      });
    }
  }, [expenseToEdit]);

  // Update individual form fields
  const updateField = <K extends keyof ExpenseFormData>(
    field: K,
    value: ExpenseFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }

      updateField('receiptFile', file);
      const url = URL.createObjectURL(file);
      updateField('receiptUrl', url);

      if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.receiptUrl);
      }
    }
  };

  // Handle scan completion
  const handleScanComplete = (expenseDetails: { 
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    console.log("Handling scan complete with details:", expenseDetails);
    
    // Update form fields with scanned data
    if (expenseDetails.description) updateField('description', expenseDetails.description);
    if (expenseDetails.amount) updateField('amount', expenseDetails.amount);
    if (expenseDetails.date) {
      // Try to convert date to YYYY-MM-DD format
      try {
        const dateParts = expenseDetails.date.split(/[\/\-\.]/);
        if (dateParts.length === 3) {
          let year = dateParts[2];
          // Ensure year is 4 digits
          if (year.length === 2) {
            year = `20${year}`;
          }
          // Reformat to YYYY-MM-DD
          const formattedDate = `${year}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
          updateField('date', formattedDate);
        }
      } catch (err) {
        console.warn("Failed to parse date from receipt", err);
        // Keep current date if parsing fails
      }
    }
    if (expenseDetails.category) updateField('category', expenseDetails.category);
    if (expenseDetails.paymentMethod) updateField('paymentMethod', expenseDetails.paymentMethod);
    
    toast.success("Receipt data extracted and filled in! Please review before submitting.");
  };

  // Submit form
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

      // Invalidate both expenses and budgets queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });

      uiToast({
        title: expenseToEdit ? "Expense Updated" : "Expense Added",
        description: expenseToEdit 
          ? "Your expense has been updated successfully."
          : "Your expense has been added successfully.",
      });

      // Reset form
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        category: "Other",
        paymentMethod: "Cash",
        notes: "",
        isRecurring: false,
        receiptFile: null,
        receiptUrl: "",
      });
      onClose?.();

    } catch (error) {
      console.error('Error saving expense:', error);
      uiToast({
        title: "Error",
        description: "Failed to save the expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.receiptUrl);
      }
    };
  }, []);

  return {
    formData,
    isSubmitting,
    updateField,
    handleFileChange,
    handleScanComplete,
    handleSubmit,
  };
}
