
import React from "react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "@/components/expenses/form-fields/receipt/ReceiptFileInput";

interface DashboardExpenseSheetProps {
  showAddExpense: boolean;
  setShowAddExpense: (show: boolean) => void;
  expenseToEdit?: any;
  setExpenseToEdit: (expense?: any) => void;
  captureMode: 'manual' | 'upload' | 'camera';
  setCaptureMode: (mode: 'manual' | 'upload' | 'camera') => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  cameraInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  fileInputRef,
  cameraInputRef,
  handleFileChange,
  onExpenseAdded
}: DashboardExpenseSheetProps) => {
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowAddExpense(true);
    }
  };

  const handleSheetClose = () => {
    setShowAddExpense(false);
    setSelectedFile(null);
    setCaptureMode('manual');
    setExpenseToEdit(undefined);
  };

  return (
    <>
      {/* Hidden file inputs for receipt processing */}
      <ReceiptFileInput 
        onChange={handleFileSelection} 
        inputRef={fileInputRef} 
        id="dashboard-receipt-upload" 
        useCamera={false} 
      />
      
      <ReceiptFileInput 
        onChange={handleFileSelection} 
        inputRef={cameraInputRef} 
        id="dashboard-camera-capture" 
        useCamera={true} 
      />

      {/* Expense Sheet - triggered from Quick Actions */}
      <AddExpenseSheet 
        onAddExpense={onExpenseAdded} 
        expenseToEdit={expenseToEdit} 
        onClose={handleSheetClose} 
        open={showAddExpense || expenseToEdit !== undefined} 
        onOpenChange={setShowAddExpense} 
        initialCaptureMode={captureMode} 
        initialFile={selectedFile}
      />
    </>
  );
};
