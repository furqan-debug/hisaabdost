
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ReceiptPreview } from "./receipt/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReceiptScanDialog } from "./receipt/ReceiptScanDialog";

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
}

export function ReceiptField({ 
  receiptUrl, 
  onFileChange,
  setFileInputRef,
  setCameraInputRef,
  onCapture
}: ReceiptFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // State for receipt scanning dialog
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  
  // Expose the refs to the parent component if needed
  useEffect(() => {
    if (setFileInputRef && fileInputRef.current) {
      setFileInputRef(fileInputRef.current);
    }
    
    if (setCameraInputRef && cameraInputRef.current) {
      setCameraInputRef(cameraInputRef.current);
    }
    
    // Check if device is mobile or has camera capabilities
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
  }, [setFileInputRef, setCameraInputRef]);

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };
  
  // Handle file selection and open scan dialog
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
      setReceiptFile(file);
      
      // Open the scan dialog automatically
      setScanDialogOpen(true);
      
      // Call the original onFileChange to handle storage
      onFileChange(e);
    }
  };
  
  // Clean up resources when dialog is closed
  const handleCleanup = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    setReceiptFile(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="expense-receipt">Receipt</Label>
      <div className="space-y-2">
        <ReceiptPreview 
          receiptUrl={receiptUrl} 
          onReplace={handleUpload} 
        />
        
        {/* Hidden file input for regular uploads */}
        <Input
          id="expense-receipt"
          name="receipt"
          type="file"
          accept="image/*"
          onChange={handleFileSelection}
          ref={fileInputRef}
          className="hidden"
        />
        
        {/* Hidden file input specifically for camera capture */}
        <Input
          id="camera-capture"
          name="camera"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelection}
          ref={cameraInputRef}
          className="hidden"
        />
        
        {receiptUrl ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleUpload}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Replace Receipt
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUpload}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Receipt
            </Button>
            
            {isMobile && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Scan Dialog */}
      <ReceiptScanDialog
        file={receiptFile}
        previewUrl={filePreviewUrl}
        open={scanDialogOpen}
        setOpen={setScanDialogOpen}
        onCleanup={handleCleanup}
        onCapture={onCapture}
        autoSave={true} // Always auto-save expenses
        autoProcess={true} // Always auto-process
      />
    </div>
  );
}
