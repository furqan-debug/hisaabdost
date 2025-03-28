
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
import { useEffect, useState, useRef } from "react";
import { ReceiptScanDialog } from "./expenses/form-fields/receipt/ReceiptScanDialog";
import { toast } from "sonner";
import { generateFileFingerprint } from "@/utils/receiptFileProcessor";

interface AddExpenseSheetProps {
  onAddExpense: (expense: Expense) => void;
  expenseToEdit?: Expense;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialCaptureMode?: 'manual' | 'upload' | 'camera';
  initialFile?: File | null;
}

// Global tracking for files being processed
const processingFiles = new Map<string, boolean>();

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
  const initialFileProcessed = useRef(false);
  const initialFileFingerprint = useRef<string | null>(null);

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
    // Only process initial file once when sheet opens
    if (open && !expenseToEdit && initialFile && !initialFileProcessed.current) {
      // Generate fingerprint for the file
      const fingerprint = generateFileFingerprint(initialFile);
      initialFileFingerprint.current = fingerprint;
      
      // Check if this file is already being processed
      if (processingFiles.has(fingerprint)) {
        console.log(`Initial file is already being processed: ${fingerprint}`);
        return;
      }
      
      console.log(`Processing initial file: ${initialFile.name} (${fingerprint})`);
      processingFiles.set(fingerprint, true);
      initialFileProcessed.current = true;
      
      try {
        // Create a preview URL for the dialog
        const previewUrl = URL.createObjectURL(initialFile);
        setFilePreviewUrl(previewUrl);
        
        // Process the file for form - with small delay to avoid race conditions
        setTimeout(() => {
          processReceiptFile(initialFile).catch(err => {
            console.error("Error processing receipt file:", err);
            setProcessingError("Failed to process receipt image");
            processingFiles.delete(fingerprint);
          });
        }, 100);
        
        // Always show scan dialog if we have a file
        setShowScanDialog(true);
      } catch (error) {
        console.error("Error setting up initial file:", error);
        toast.error("Failed to process the receipt image");
        if (initialFileFingerprint.current) {
          processingFiles.delete(initialFileFingerprint.current);
        }
      }
    }
  }, [open, expenseToEdit, initialFile, processReceiptFile]);

  // Reset state when sheet is closed
  useEffect(() => {
    if (!open) {
      initialFileProcessed.current = false;
      if (initialFileFingerprint.current) {
        processingFiles.delete(initialFileFingerprint.current);
        initialFileFingerprint.current = null;
      }
    }
  }, [open]);

  // Clean up preview URL when closing
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      if (initialFileFingerprint.current) {
        processingFiles.delete(initialFileFingerprint.current);
      }
    };
  }, [filePreviewUrl]);

  // Handle scan dialog cleanup
  const handleScanDialogCleanup = () => {
    console.log("Cleaning up scan dialog resources");
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setShowScanDialog(false);
    setProcessingError(null);
    
    // Remove from processing tracking
    if (initialFileFingerprint.current) {
      processingFiles.delete(initialFileFingerprint.current);
    }
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
