
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
    triggerCameraCapture
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</SheetTitle>
          <SheetDescription>
            {expenseToEdit 
              ? "Edit your expense details below." 
              : "Review and complete your expense details below. Click save when you're done."}
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
        />
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;
export { type Expense } from "./expenses/types";
