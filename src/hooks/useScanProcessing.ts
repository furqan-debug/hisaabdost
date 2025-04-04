
import { useState, useRef, useEffect } from "react";
import { generateFileFingerprint } from "@/utils/receiptFileProcessor";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/components/expenses/types";

// Global tracking for files being processed
const processingFiles = new Map<string, boolean>();

interface UseScanProcessingProps {
  initialFile: File | null;
  initialCaptureMode: 'manual' | 'upload' | 'camera';
  expenseToEdit?: Expense;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onAddExpense: (expense?: Expense) => void;
  processReceiptFile: (file: File) => Promise<string | null>;
}

export function useScanProcessing({
  initialFile,
  initialCaptureMode,
  expenseToEdit,
  open,
  onClose,
  onOpenChange,
  onAddExpense,
  processReceiptFile
}: UseScanProcessingProps) {
  const queryClient = useQueryClient();
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const initialFileProcessed = useRef(false);
  const initialFileFingerprint = useRef<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // Determine if this is a manual entry or auto-process mode
  const isManualEntry = initialCaptureMode === 'manual' || !!expenseToEdit;

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
          processReceiptFile(initialFile)
            .then((result) => {
              console.log("Initial file processing result:", result);
              // For non-manual entry mode, always show the scan dialog
              if (initialCaptureMode !== 'manual') {
                console.log("Setting scan dialog to open for auto-processing");
                setShowScanDialog(true);
              }
            })
            .catch(err => {
              console.error("Error processing receipt file:", err);
              setProcessingError("Failed to process receipt image");
              toast.error("Error processing receipt");
              processingFiles.delete(fingerprint);
            });
        }, 100);
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

  // Clean up preview URL when unmounting
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

  // Handle scan completion by closing the sheet after a delay
  const handleScanSuccess = () => {
    console.log("Scan completed successfully");
    setProcessingComplete(true);
    
    // Force invalidate the query cache to refresh expense list
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
    
    // Notify parent about the expense addition
    if (onAddExpense) {
      console.log("Calling onAddExpense callback after successful scan");
      onAddExpense(); // Call without arguments to trigger a general refresh
    }
    
    // Close the sheet after a delay
    setTimeout(() => {
      if (onOpenChange) {
        onOpenChange(false);
      }
      if (onClose) {
        onClose();
      }
    }, 1000);
  };

  // Handle sheet close
  const handleSheetClose = (open: boolean) => {
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

  return {
    showScanDialog,
    setShowScanDialog,
    filePreviewUrl,
    processingError,
    isManualEntry,
    processingComplete,
    handleScanDialogCleanup,
    handleScanSuccess,
    handleSheetClose
  };
}
