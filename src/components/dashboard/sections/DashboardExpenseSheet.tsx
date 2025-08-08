
import React, { useEffect, useRef } from "react";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { useExpenseFile } from "@/hooks/use-expense-file";
import { toast } from "sonner";
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
  const { handleFileChange, fileInputRef, triggerFileUpload } = useExpenseFile();

  useEffect(() => {
    const handleExpenseFormEvent = async (event: any) => {
      const { mode, file } = event.detail;
      console.log('Dashboard: Received open-expense-form event:', mode, file?.name);
      
      setCaptureMode(mode);
      if (file) {
        // Validate file before processing
        const { validateReceiptFile, showReceiptError } = await import('@/utils/receipt/errorHandling');
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
    <>
      <AddExpenseSheet 
        onAddExpense={onExpenseAdded} 
        expenseToEdit={expenseToEdit} 
        onClose={handleSheetClose} 
        open={showAddExpense || expenseToEdit !== undefined} 
        onOpenChange={setShowAddExpense} 
        initialCaptureMode={captureMode} 
        initialFile={selectedFile}
      />
      
      {/* Hidden file inputs with validation for dashboard actions */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const validation = validateReceiptFile(file);
            if (!validation.isValid) {
              showReceiptError(validation.error!);
              e.target.value = '';
              return;
            }
            
            setSelectedFile(file);
            // Dispatch event to open expense form with upload mode
            window.dispatchEvent(new CustomEvent('open-expense-form', { 
              detail: { mode: 'upload', file: file } 
            }));
          }
        }}
      />
    </>
  );
};
