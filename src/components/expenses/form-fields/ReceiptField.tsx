
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { ReceiptPreview } from "./receipt/ReceiptPreview";
import { ReceiptScanDialog } from "./receipt/ReceiptScanDialog";
import { ReceiptActions } from "./receipt/ReceiptActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReceiptFileInput } from "./receipt/ReceiptFileInput";
import { generateFileFingerprint } from "@/utils/receiptFileProcessor";
import { toast } from "sonner";

interface ReceiptFieldProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFileInputRef?: (ref: HTMLInputElement | null) => void;
  setCameraInputRef?: (ref: HTMLInputElement | null) => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  autoProcess?: boolean;
}

// Track processing events to prevent duplicates across instances
const processingCache = new Map<string, boolean>();

export function ReceiptField({ 
  receiptUrl, 
  onFileChange,
  setFileInputRef,
  setCameraInputRef,
  onCapture,
  autoProcess = true
}: ReceiptFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // State for receipt scanning dialog
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [processingStarted, setProcessingStarted] = useState(false);
  const currentFileFingerprint = useRef<string | null>(null);
  
  // Expose the refs to the parent component if needed
  useEffect(() => {
    if (setFileInputRef && fileInputRef.current) {
      setFileInputRef(fileInputRef.current);
    }
    
    if (setCameraInputRef && cameraInputRef.current) {
      setCameraInputRef(cameraInputRef.current);
    }
  }, [setFileInputRef, setCameraInputRef]);

  const handleUpload = () => {
    if (!processingStarted && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCameraCapture = () => {
    if (!processingStarted && cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };
  
  // Handle file selection and open scan dialog
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Image file too large. Please select a file smaller than 2MB.');
      return;
    }
    
    // Generate fingerprint for the file
    const fingerprint = generateFileFingerprint(file);
    console.log(`📁 File selected: ${file.name} (${file.size} bytes, type: ${file.type}, fingerprint: ${fingerprint})`);
    
    // Check if this file is already being processed in any component
    if (processingCache.has(fingerprint)) {
      console.log(`⚠️ File is already being processed: ${fingerprint}`);
      toast.info('This receipt is already being processed');
      return;
    }
    
    // Call the original onFileChange to handle storage
    onFileChange(e);
    
    // Only proceed with auto-processing if autoProcess is enabled
    if (autoProcess) {
      // Record that we're processing this file
      processingCache.set(fingerprint, true);
      currentFileFingerprint.current = fingerprint;
      
      // Flag that we've started processing to prevent reopening
      setProcessingStarted(true);
      
      // Store the file for scanning
      setReceiptFile(file);
      
      // Open scan dialog for processing
      console.log("🔍 Opening scan dialog for automatic processing...");
      setScanDialogOpen(true);
    } else {
      console.log("📎 File uploaded for manual form - no auto-processing");
    }
    
    // Reset the file input so the same file can be selected again later
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Handle retrying the scan with the existing file
  const handleRetryScan = () => {
    if (receiptFile) {
      console.log("🔄 Retrying scan with existing file");
      setScanDialogOpen(true);
    }
  };
  
  // Clean up resources when dialog is closed
  const handleCleanup = () => {
    console.log("🧹 Cleaning up resources for file:", currentFileFingerprint.current);
    // Remove from processing cache
    if (currentFileFingerprint.current) {
      processingCache.delete(currentFileFingerprint.current);
      currentFileFingerprint.current = null;
    }
    
    setReceiptFile(null);
    setProcessingStarted(false); // Allow new uploads after cleanup
  };
  
  // Handle successful scan completion
  const handleScanSuccess = () => {
    console.log("✅ Receipt scan completed successfully, triggering refresh");
    
    // Show success message
    toast.success('Receipt processed successfully!');
    
    // Dispatch events to refresh expense lists
    const eventDetail = { 
      timestamp: Date.now(), 
      action: 'receipt-scan',
      source: 'receipt-field' 
    };
    
    window.dispatchEvent(new CustomEvent('expenses-updated', { detail: eventDetail }));
    window.dispatchEvent(new CustomEvent('receipt-scanned', { detail: eventDetail }));
    window.dispatchEvent(new CustomEvent('expense-refresh', { detail: eventDetail }));
    
    console.log("📡 Refresh events dispatched from ReceiptField");
  };
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Clean up processing cache
      if (currentFileFingerprint.current) {
        processingCache.delete(currentFileFingerprint.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="expense-receipt">Receipt</Label>
      <div className="space-y-2">
        <ReceiptPreview 
          receiptUrl={receiptUrl} 
          onReplace={handleUpload} 
        />
        
        {/* Hidden file inputs */}
        <ReceiptFileInput
          id="expense-receipt"
          onChange={handleFileSelection}
          inputRef={fileInputRef}
          useCamera={false}
          accept="image/*"
        />
        
        <ReceiptFileInput
          id="camera-capture"
          onChange={handleFileSelection}
          inputRef={cameraInputRef}
          useCamera={true}
          accept="image/*"
        />
        
        <ReceiptActions
          receiptUrl={receiptUrl}
          onUpload={handleUpload}
          onCapture={isMobile ? handleCameraCapture : undefined}
          onRetry={receiptFile && autoProcess ? handleRetryScan : undefined}
          showCameraButton={isMobile}
          showRetryButton={!!receiptFile && autoProcess}
          isProcessing={processingStarted}
        />
      </div>
      
      {/* Scan Dialog - shown when a file is selected for auto-processing */}
      {receiptFile && (
        <ReceiptScanDialog
          file={receiptFile}
          previewUrl={null}
          open={scanDialogOpen}
          setOpen={setScanDialogOpen}
          onCleanup={handleCleanup}
          onCapture={onCapture}
          autoSave={true}
          autoProcess={autoProcess}
          onSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
}
