
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExpenseForm } from "./expenses/ExpenseForm";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { Expense } from "./expenses/types";
import { useEffect } from "react";

interface AddExpenseSheetProps {
  onAddExpense: (expense: Expense) => void;
  expenseToEdit?: Expense;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialCaptureMode?: 'manual' | 'upload' | 'camera';
}

const AddExpenseSheet = ({ 
  onAddExpense, 
  expenseToEdit, 
  onClose,
  open,
  onOpenChange,
  initialCaptureMode = 'manual'
}: AddExpenseSheetProps) => {
  const {
    formData,
    isSubmitting,
    isUploading,
    updateField,
    handleFileChange,
    handleSubmit,
    triggerFileUpload,
    triggerCameraCapture,
    setFileInputRef,
    setCameraInputRef,
    handleScanComplete
  } = useExpenseForm({ 
    expenseToEdit, 
    onClose 
  });

  // Handle initial capture mode
  useEffect(() => {
    if (open && !expenseToEdit) {
      // Only trigger if opening a new expense, not editing
      if (initialCaptureMode === 'upload') {
        setTimeout(() => {
          triggerFileUpload();
        }, 100);
      } else if (initialCaptureMode === 'camera') {
        setTimeout(() => {
          triggerCameraCapture();
        }, 100);
      }
    }
  }, [open, expenseToEdit, initialCaptureMode, triggerFileUpload, triggerCameraCapture]);

  // Determine if this is a manual entry or automated receipt process
  const isManualEntry = initialCaptureMode === 'manual' || !!expenseToEdit;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</SheetTitle>
          <SheetDescription>
            {expenseToEdit 
              ? "Edit your expense details below." 
              : isManualEntry
                ? "Enter expense details manually or add a receipt for reference."
                : "Upload a receipt for automatic processing."
            }
          </SheetDescription>
        </SheetHeader>
        
        <ExpenseForm
          formData={formData}
          isSubmitting={isSubmitting}
          isEditing={!!expenseToEdit}
          isUploading={isUploading}
          onSubmit={handleSubmit}
          onFieldChange={updateField}
          onFileChange={handleFileChange}
          setFileInputRef={setFileInputRef}
          setCameraInputRef={setCameraInputRef}
          onScanComplete={handleScanComplete}
          isManualEntry={isManualEntry}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;
export { type Expense } from "./expenses/types";
