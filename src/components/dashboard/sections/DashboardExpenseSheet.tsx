
import React, { useEffect } from "react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { validateReceiptFile, showReceiptError } from "@/utils/receipt/errorHandling";

interface DashboardExpenseSheetProps {
  showAddExpense: boolean;
  setShowAddExpense: (show: boolean) => void;
  expenseToEdit?: any;
  setExpenseToEdit: (expense?: any) => void;
  captureMode: 'manual' | 'upload' | 'camera';
  setCaptureMode: (mode: 'manual' | 'upload' | 'camera') => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  onExpenseAdded: () => void;
}

export const DashboardExpenseSheet = ({
  showAddExpense,
  setShowAddExpense,
  expenseToEdit,
  setExpenseToEdit,
  captureMode,
  setCaptureMode,
  selectedFile,
  setSelectedFile,
  onExpenseAdded
}: DashboardExpenseSheetProps) => {
  useEffect(() => {
    const handleExpenseFormEvent = async (event: any) => {
      const { mode, file } = event.detail;
      console.log('Dashboard: Received open-expense-form event:', mode, file?.name);
      
      setCaptureMode(mode);
      if (file) {
        // Validate file before processing
        const validation = validateReceiptFile(file);
        if (!validation.isValid) {
          showReceiptError(validation.error!);
          return;
        }
        
        setSelectedFile(file);
      }
      setShowAddExpense(true);
    };

    window.addEventListener('open-expense-form', handleExpenseFormEvent);
    return () => {
      window.removeEventListener('open-expense-form', handleExpenseFormEvent);
    };
  }, [setCaptureMode, setSelectedFile, setShowAddExpense]);

  const handleSheetClose = () => {
    setShowAddExpense(false);
    setSelectedFile(null);
    setCaptureMode('manual');
    setExpenseToEdit(undefined);
  };

  return (
    <AddExpenseSheet 
      onAddExpense={onExpenseAdded} 
      expenseToEdit={expenseToEdit} 
      onClose={handleSheetClose} 
      open={showAddExpense || expenseToEdit !== undefined} 
      onOpenChange={setShowAddExpense} 
      initialCaptureMode={captureMode} 
      initialFile={selectedFile}
    />
  );
};
