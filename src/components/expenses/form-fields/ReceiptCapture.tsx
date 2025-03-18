
import { useState, useRef, ReactNode } from "react";
import { toast } from "sonner";
import { ReceiptUploadOptions } from "./receipt/ReceiptUploadOptions";
import { ReceiptFileInput } from "./receipt/ReceiptFileInput";
import { ReceiptScanDialog } from "./receipt/ReceiptScanDialog";
import { cn } from "@/lib/utils";

interface ReceiptCaptureProps {
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  disabled?: boolean;
  autoSave?: boolean;
  className?: string;
  children?: ReactNode;
}

export function ReceiptCapture({ 
  onCapture, 
  disabled = false, 
  autoSave = false, 
  className,
  children 
}: ReceiptCaptureProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.match('image.*') && selectedFile.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }
      
      // Check if file size is reasonable (less than 5MB for better performance)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Image is too large. Please use an image smaller than 5MB for faster processing');
        return;
      }
      
      setFile(selectedFile);
      try {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        setShowDialog(true);
      } catch (error) {
        toast.error('Failed to preview the image. Please try another image.');
        console.error("Preview creation error:", error);
      }
    }
  };

  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFile(null);
    setShowDialog(false);
  };

  const uploadFile = () => {
    if (fileInputRef.current) {
      // Remove any capture attribute that might have been set previously
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const capturePhoto = () => {
    if (fileInputRef.current) {
      // Use 'environment' for back camera, 'user' for front camera
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={cn("receipt-capture-container", className)}
      onClick={children ? undefined : capturePhoto}
    >
      <ReceiptFileInput 
        onChange={handleFileChange} 
        inputRef={fileInputRef} 
      />
      
      {children ? (
        <div onClick={(e) => {
          e.stopPropagation();
          capturePhoto();
        }}>
          {children}
        </div>
      ) : (
        <ReceiptUploadOptions
          onUpload={uploadFile}
          onCapture={capturePhoto}
          disabled={disabled}
        />
      )}

      <ReceiptScanDialog
        file={file}
        previewUrl={previewUrl}
        open={showDialog}
        setOpen={setShowDialog}
        onCleanup={cleanupPreview}
        onCapture={onCapture}
        autoSave={autoSave}
      />
    </div>
  );
}
