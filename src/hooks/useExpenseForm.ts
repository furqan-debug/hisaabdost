
import { useState, useEffect, useRef } from 'react';
import { Expense } from "@/components/expenses/types";
import { ExpenseFormData, UseExpenseFormProps } from './expense-form/types';
import { useReceiptFile } from './expense-form/useReceiptFile';
import { useReceiptScanner } from './expense-form/useReceiptScanner';
import { useExpenseSubmit } from './expense-form/useExpenseSubmit';

export type { ExpenseFormData } from './expense-form/types';

export function useExpenseForm({ expenseToEdit, onClose }: UseExpenseFormProps) {
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

  const { handleFileChange, isUploading } = useReceiptFile({ 
    formData, 
    updateField 
  });

  const { handleScanComplete } = useReceiptScanner({ 
    updateField 
  });

  const { isSubmitting, handleSubmit } = useExpenseSubmit({
    expenseToEdit,
    onClose,
    formData,
    resetForm
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

  return {
    formData,
    isSubmitting,
    isUploading,
    updateField,
    handleFileChange,
    handleScanComplete,
    handleSubmit,
    triggerFileUpload,
    triggerCameraCapture,
    setFileInputRef,
    setCameraInputRef
  };
}
