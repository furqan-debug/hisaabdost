
import React from "react";
import AddExpenseSheet from "@/components/AddExpenseSheet";

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
