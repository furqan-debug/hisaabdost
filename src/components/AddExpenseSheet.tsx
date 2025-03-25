
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
import { useEffect, useState } from "react";
import { ReceiptScanDialog } from "./expenses/form-fields/receipt/ReceiptScanDialog";

interface AddExpenseSheetProps {
  onAddExpense: (expense: Expense) => void;
  expenseToEdit?: Expense;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialCaptureMode?: 'manual' | 'upload' | 'camera';
  initialFile?: File | null;
}

const AddExpenseSheet = ({ 
  onAddExpense, 
  expenseToEdit, 
  onClose,
  open,
  onOpenChange,
  initialCaptureMode = 'manual',
  initialFile = null
}: AddExpenseSheetProps) => {
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

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
    handleScanComplete,
    processReceiptFile
  } = useExpenseForm({ 
    expenseToEdit, 
    onClose 
  });

  // Handle initial capture mode and file
  useEffect(() => {
    if (open && !expenseToEdit) {
      if (initialFile) {
        // For upload/camera modes with a file, we need to auto-process
        if (initialCaptureMode === 'upload' || initialCaptureMode === 'camera') {
          // Create a preview URL for the dialog
          const previewUrl = URL.createObjectURL(initialFile);
          setFilePreviewUrl(previewUrl);
          
          // Process the file for form
          processReceiptFile(initialFile);
          
          // Show the scan dialog
          setShowScanDialog(true);
        } 
        // For manual mode with a file, just process it for the form
        else if (initialCaptureMode === 'manual') {
          processReceiptFile(initialFile);
        }
      }
    }
  }, [open, expenseToEdit, initialFile, initialCaptureMode, processReceiptFile]);

  // Clean up preview URL when closing
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  // Handle scan dialog cleanup
  const handleScanDialogCleanup = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setShowScanDialog(false);
  };

  // Determine if this is a manual entry or automated receipt process
  const isManualEntry = initialCaptureMode === 'manual' || !!expenseToEdit;

  return (
    <>
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

      {/* Separate receipt scan dialog for auto-processing */}
      {initialFile && (initialCaptureMode === 'upload' || initialCaptureMode === 'camera') && (
        <ReceiptScanDialog
          file={initialFile}
          previewUrl={filePreviewUrl}
          open={showScanDialog}
          setOpen={setShowScanDialog}
          onCleanup={handleScanDialogCleanup}
          onCapture={handleScanComplete}
          autoSave={true}
          autoProcess={true}
        />
      )}
    </>
  );
};

export default AddExpenseSheet;
export { type Expense } from "./expenses/types";
