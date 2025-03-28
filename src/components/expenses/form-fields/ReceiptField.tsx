
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { ReceiptPreview } from "./receipt/ReceiptPreview";
import { ReceiptScanDialog } from "./receipt/ReceiptScanDialog";
import { ReceiptActions } from "./receipt/ReceiptActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReceiptFileInput } from "./receipt/ReceiptFileInput";

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
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [processingStarted, setProcessingStarted] = useState(false);
  
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
    // Only open file dialog if we're not already processing a receipt
    if (!processingStarted && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCameraCapture = () => {
    // Only open camera if we're not already processing a receipt
    if (!processingStarted && cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };
  
  // Handle file selection and open scan dialog
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(`File selected: ${file.name} (${file.size} bytes, type: ${file.type})`);
      
      // Flag that we've started processing to prevent reopening
      setProcessingStarted(true);
      
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
      setReceiptFile(file);
      
      // Always open scan dialog if we have a file and autoProcess is enabled
      if (autoProcess) {
        setScanDialogOpen(true);
      }
      
      // Call the original onFileChange to handle storage
      onFileChange(e);
      
      // Reset the file input so the same file can be selected again later
      if (e.target) {
        e.target.value = '';
      }
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
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setReceiptFile(null);
    setProcessingStarted(false); // Allow new uploads after cleanup
  };
  
  // Handle manual entry after scan fails
  const handleManualEntry = () => {
    // Just close the dialog but keep the receipt image
    setScanDialogOpen(false);
    setProcessingStarted(false);
  };

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
          onRetry={receiptFile ? handleRetryScan : undefined}
          showCameraButton={isMobile}
          showRetryButton={!!receiptFile}
          isProcessing={processingStarted}
        />
      </div>
      
      {/* Scan Dialog - only shown when scanDialogOpen is true */}
      {receiptFile && (
        <ReceiptScanDialog
          file={receiptFile}
          previewUrl={filePreviewUrl}
          open={scanDialogOpen}
          setOpen={setScanDialogOpen}
          onCleanup={handleCleanup}
          onCapture={onCapture}
          autoSave={true}
          autoProcess={autoProcess}
          onManualEntry={handleManualEntry}
        />
      )}
    </div>
  );
}
