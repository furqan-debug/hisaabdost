
import { Label } from "@/components/ui/label";
import { useRef, useEffect } from "react"; // Fixed import - added 'useEffect'
import { ReceiptPreview } from "./receipt/ReceiptPreview";
import { ReceiptActions } from "./receipt/ReceiptActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReceiptFileInput } from "./receipt/ReceiptFileInput";
import { ReceiptScanManager } from "./receipt/ReceiptScanManager";
import { useReceiptFileHandler } from "@/hooks/useReceiptFileHandler";
import { useAuth } from "@/lib/auth";

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
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Use our new custom hook
  const {
    scanDialogOpen,
    setScanDialogOpen,
    receiptFile,
    filePreviewUrl,
    processingStarted,
    handleFileSelection,
    handleRetryScan,
    handleCleanup
  } = useReceiptFileHandler({
    userId: user?.id,
    receiptUrl,
    autoProcess,
    updateField: () => {}, // We don't need this in this component
    onCapture
  });
  
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
  
  // Wrapper for file selection handler
  const handleLocalFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e);
    // Call the original onFileChange to handle storage
    onFileChange(e);
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
          onChange={handleLocalFileSelection}
          inputRef={fileInputRef}
          useCamera={false}
          accept="image/*"
        />
        
        <ReceiptFileInput
          id="camera-capture"
          onChange={handleLocalFileSelection}
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
      
      {/* Use our new scan manager component */}
      {autoProcess && (
        <ReceiptScanManager
          file={receiptFile}
          previewUrl={filePreviewUrl}
          open={scanDialogOpen}
          setOpen={setScanDialogOpen}
          onCleanup={handleCleanup}
          onCapture={onCapture}
          autoSave={true}
          autoProcess={true}
        />
      )}
    </div>
  );
}
