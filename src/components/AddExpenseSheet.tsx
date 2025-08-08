import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ExpenseForm } from "./expenses/ExpenseForm";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { Expense } from "./expenses/types";
import { useEffect, useState, useRef } from "react";
import { ReceiptScanDialog } from "./expenses/form-fields/receipt/ReceiptScanDialog";
import { toast } from "sonner";
import { generateFileFingerprint } from "@/utils/receiptFileProcessor";
import { useModalState } from "@/hooks/useModalState";
import { useKeyboardViewportFix } from "@/hooks/useKeyboardViewportFix";

interface AddExpenseSheetProps {
  onAddExpense: (expense?: Expense) => void;
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
  initialCaptureMode = 'manual',
  initialFile = null
}: AddExpenseSheetProps) => {
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const initialFileProcessed = useRef(false);
  const initialFileFingerprint = useRef<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const { setModalOpen } = useModalState();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  // Determine if this is a manual entry or auto-process mode
  const isManualEntry = initialCaptureMode === 'manual' || !!expenseToEdit;

  // Ensure the sheet restores correctly when the keyboard hides
  useKeyboardViewportFix({ sheetRef, scrollRef, enabled: !!open });

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
            if (initialFileFingerprint.current) {
              processingFiles.delete(initialFileFingerprint.current);
            }
          });
        }, 100);
        
        // Only show scan dialog for auto-processing modes (upload, camera)
        if (initialCaptureMode !== 'manual') {
          setShowScanDialog(true);
        }
      } catch (error) {
        console.error("Error setting up initial file:", error);
        toast.error("Failed to process the receipt image");
        if (initialFileFingerprint.current) {
          processingFiles.delete(initialFileFingerprint.current);
        }
      }
    }
  }, [open, expenseToEdit, initialFile, initialCaptureMode, processReceiptFile]);

  // Reset state when sheet is closed
  useEffect(() => {
    if (!open) {
      initialFileProcessed.current = false;
      if (initialFileFingerprint.current) {
        processingFiles.delete(initialFileFingerprint.current);
        initialFileFingerprint.current = null;
      }
      setProcessingComplete(false);
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

  // Handle sheet close
  const handleSheetClose = (open: boolean) => {
    setModalOpen(open); // Track modal state for banner ads
    
    if (!open) {
      // Clean up any resources
      handleScanDialogCleanup();
      
      // Call the parent's onOpenChange if provided
      if (onOpenChange) {
        onOpenChange(false);
      }
      
      // Call onClose if provided
      if (onClose) {
        onClose();
      }
    } else if (onOpenChange) {
      onOpenChange(true);
    }
  };

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

  // Handle scan completion by closing the sheet after a delay
  const handleScanSuccess = () => {
    setProcessingComplete(true);
    
    // Notify parent about the expense addition
    if (onAddExpense) {
      console.log("Calling onAddExpense callback after successful scan");
      onAddExpense();
    }
    
    // Close the sheet automatically after a delay
    setTimeout(() => {
      if (onOpenChange) {
        onOpenChange(false);
      }
      if (onClose) {
        onClose();
      }
    }, 1500);
  };

  return (
    <>
      {/* Only show the expense form sheet for manual entry or editing */}
      {(isManualEntry || !initialFile) && (
        <Drawer open={open} onOpenChange={handleSheetClose}>
          <DrawerContent ref={sheetRef} className="max-h-[95dvh] md:max-h-[90vh] keyboard-safe">
            <DrawerHeader className="text-center pb-2">
              <DrawerTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</DrawerTitle>
              <DrawerDescription>
                {expenseToEdit 
                  ? "Edit your expense details below." 
                  : "Enter your expense information"
                }
              </DrawerDescription>
            </DrawerHeader>
            
            <div ref={scrollRef} className="px-4 pb-6 flex-1 overflow-y-auto min-h-0 form-container">
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
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Receipt scanning dialog - only shown for auto-process modes */}
      {!isManualEntry && initialFile && filePreviewUrl && (
        <ReceiptScanDialog
          file={initialFile}
          previewUrl={filePreviewUrl}
          open={showScanDialog}
          setOpen={setShowScanDialog}
          onCleanup={handleScanDialogCleanup}
          onCapture={handleScanComplete}
          autoSave={true}
          autoProcess={true}
          onSuccess={handleScanSuccess}
        />
      )}
    </>
  );
};

export default AddExpenseSheet;
export { type Expense } from "./expenses/types";
