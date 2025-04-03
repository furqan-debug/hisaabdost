
import { useState, useRef, useEffect } from "react";
import { ExpenseFormData } from "@/hooks/expense-form/types";
import { generateFileFingerprint, processReceiptFile } from "@/utils/receiptFileProcessor";
import { toast } from "sonner";

interface UseReceiptFileHandlerProps {
  userId?: string;
  receiptUrl: string;
  autoProcess: boolean;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
}

export function useReceiptFileHandler({
  userId,
  receiptUrl,
  autoProcess,
  updateField,
  onCapture
}: UseReceiptFileHandlerProps) {
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [processingStarted, setProcessingStarted] = useState(false);
  const currentFileFingerprint = useRef<string | null>(null);

  // Handle file selection and open scan dialog
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    // Generate fingerprint for the file
    const fingerprint = generateFileFingerprint(file);
    console.log(`File selected: ${file.name} (${file.size} bytes, type: ${file.type}, fingerprint: ${fingerprint})`);
    
    // Check for duplicate processing
    if (processingCache.has(fingerprint)) {
      console.log(`File is already being processed: ${fingerprint}`);
      toast.info("This file is already being processed");
      return;
    }
    
    // Record that we're processing this file
    processingCache.set(fingerprint, true);
    currentFileFingerprint.current = fingerprint;
    
    // Flag that we've started processing to prevent reopening
    setProcessingStarted(true);
    
    // Create a preview URL for the file
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    setReceiptFile(file);
    
    // Only open scan dialog for auto-processing
    if (autoProcess) {
      setScanDialogOpen(true);
    }
    
    // Call the onFileChange to handle storage in the parent component
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Handle retrying the scan with the existing file
  const handleRetryScan = () => {
    if (receiptFile && filePreviewUrl) {
      setScanDialogOpen(true);
    }
  };
  
  // Clean up resources when dialog is closed
  const handleCleanup = () => {
    console.log("Cleaning up resources for file:", currentFileFingerprint.current);
    // Remove from processing cache
    if (currentFileFingerprint.current) {
      processingCache.delete(currentFileFingerprint.current);
      currentFileFingerprint.current = null;
    }
    
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setReceiptFile(null);
    setProcessingStarted(false); // Allow new uploads after cleanup
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      // Clean up processing cache
      if (currentFileFingerprint.current) {
        processingCache.delete(currentFileFingerprint.current);
      }
    };
  }, [filePreviewUrl]);

  return {
    scanDialogOpen,
    setScanDialogOpen,
    receiptFile,
    filePreviewUrl,
    processingStarted,
    handleFileSelection,
    handleRetryScan,
    handleCleanup
  };
}

// Track processing events to prevent duplicates across instances
const processingCache = new Map<string, boolean>();
