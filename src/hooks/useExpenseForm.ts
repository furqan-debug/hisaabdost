
import { useState, useEffect, useRef } from 'react';
import { Expense } from "@/components/expenses/types";
import { ExpenseFormData, UseExpenseFormProps } from './expense-form/types';
import { useReceiptFile } from './expense-form/useReceiptFile';
import { useReceiptScanner } from './expense-form/useReceiptScanner';
import { useExpenseSubmit } from './expense-form/useExpenseSubmit';
import { toast } from "sonner";
import { formatSafeAmount, formatSafeDate, guessCategoryFromDescription } from '@/components/expenses/form-fields/receipt/utils/formatUtils';

export type { ExpenseFormData } from './expense-form/types';

export function useExpenseForm({ expenseToEdit, onClose, onAddExpense }: UseExpenseFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  
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

  const updateField = <K extends keyof ExpenseFormData>(
    field: K,
    value: ExpenseFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
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
  };

  const { processReceiptFile, isUploading } = useReceiptFile({ 
    formData, 
    updateField 
  });

  // We need to define our own handleFileChange function since it's no longer provided by useReceiptFile
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log(`File selected: ${file.name} (${file.size} bytes, type: ${file.type})`);
    
    // Update the form with the file
    updateField('receiptFile', file);
    
    // Process the file to get a preview URL
    processReceiptFile(file);
    
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const { handleScanComplete } = useReceiptScanner({ 
    updateField 
  });

  const { isSubmitting, handleSubmit } = useExpenseSubmit({
    expenseToEdit,
    onClose,
    formData,
    resetForm,
    onAddExpense
  });
  
  // Functions to trigger file upload or camera capture
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const triggerCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };
  
  // Expose the refs for ReceiptField component
  const setFileInputRef = (ref: HTMLInputElement | null) => {
    fileInputRef.current = ref;
  };
  
  const setCameraInputRef = (ref: HTMLInputElement | null) => {
    cameraInputRef.current = ref;
  };
  
  // Handle receipt scan completion with extracted data
  const handleScanCompleteWithFeedback = (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    console.log("Receipt scan completed with details:", expenseDetails);
    
    // Format and validate the data before updating the form
    const formattedDetails = {
      description: expenseDetails.description || "Store Purchase",
      amount: formatSafeAmount(expenseDetails.amount || "0.00"),
      date: formatSafeDate(expenseDetails.date || new Date().toISOString().split('T')[0]),
      category: expenseDetails.category || guessCategoryFromDescription(expenseDetails.description) || "Other",
      paymentMethod: expenseDetails.paymentMethod || "Card"
    };
    
    // Update form with extracted data
    if (formattedDetails.description) {
      updateField('description', formattedDetails.description);
    }
    
    if (formattedDetails.amount) {
      updateField('amount', formattedDetails.amount);
    }
    
    if (formattedDetails.date) {
      updateField('date', formattedDetails.date);
    }
    
    if (formattedDetails.category) {
      updateField('category', formattedDetails.category);
    }
    
    if (formattedDetails.paymentMethod) {
      updateField('paymentMethod', formattedDetails.paymentMethod);
    }
    
    // Show toast confirmation
    toast.success("Receipt scanned and form updated");
    
    // Call the original handler
    handleScanComplete();
  };

  return {
    formData,
    isSubmitting,
    isUploading,
    updateField,
    handleFileChange,
    handleScanComplete: handleScanCompleteWithFeedback,
    handleSubmit,
    triggerFileUpload,
    triggerCameraCapture,
    setFileInputRef,
    setCameraInputRef,
    processReceiptFile
  };
}
