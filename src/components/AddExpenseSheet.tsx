
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
import { toast } from "sonner";

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
  initialCaptureMode = 'upload', // Default to auto-upload mode
  initialFile = null
}: AddExpenseSheetProps) => {
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

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
    onClose,
    onAddExpense
  });

  // Handle initial capture mode and file
  useEffect(() => {
    if (open && !expenseToEdit && initialFile) {
      try {
        // For upload/camera modes with a file, we need to auto-process
        // Create a preview URL for the dialog
        const previewUrl = URL.createObjectURL(initialFile);
        setFilePreviewUrl(previewUrl);
        
        // Process the file for form
        processReceiptFile(initialFile).catch(err => {
          console.error("Error processing receipt file:", err);
          setProcessingError("Failed to process receipt image");
        });
        
        // Always show scan dialog if we have a file
        setShowScanDialog(true);
      } catch (error) {
        console.error("Error setting up initial file:", error);
        toast.error("Failed to process the receipt image");
      }
    }
  }, [open, expenseToEdit, initialFile, processReceiptFile]);

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
    setProcessingError(null);
  };

  // Determine if this is a manual entry or automated receipt process
  const isManualEntry = initialCaptureMode === 'manual' || !!expenseToEdit;

  // Handle sheet close
  const handleSheetClose = (open: boolean) => {
    if (!open) {
      // Clean up any resources
      handleScanDialogCleanup();
      
      // Call the parent's onOpenChange if provided
      if (onOpenChange) {
        onOpenChange(false);
      }
    } else if (onOpenChange) {
      onOpenChange(true);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetClose}>
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

      {/* Receipt scanning dialog */}
      {(initialFile || filePreviewUrl) && (
        <ReceiptScanDialog
          file={initialFile}
          previewUrl={filePreviewUrl}
          open={showScanDialog}
          setOpen={setShowScanDialog}
          onCleanup={handleScanDialogCleanup}
          onCapture={handleScanComplete}
          autoSave={true}
          autoProcess={true}
          onManualEntry={() => setShowScanDialog(false)}
        />
      )}
    </>
  );
};

export default AddExpenseSheet;
export { type Expense } from "./expenses/types";
