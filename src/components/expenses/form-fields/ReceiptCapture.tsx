
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ReceiptUploadOptions } from "./receipt/ReceiptUploadOptions";
import { ReceiptFileInput } from "./receipt/ReceiptFileInput";
import { ReceiptScanDialog } from "./receipt/ReceiptScanDialog";

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
}

export function ReceiptCapture({ onCapture, disabled = false, autoSave = false }: ReceiptCaptureProps) {
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
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setShowDialog(true);
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
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const capturePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <ReceiptFileInput 
        onChange={handleFileChange} 
        inputRef={fileInputRef} 
      />
      
      <ReceiptUploadOptions
        onUpload={uploadFile}
        onCapture={capturePhoto}
        disabled={disabled}
      />

      <ReceiptScanDialog
        file={file}
        previewUrl={previewUrl}
        open={showDialog}
        setOpen={setShowDialog}
        onCleanup={cleanupPreview}
        onCapture={onCapture}
        autoSave={autoSave}
      />
    </>
  );
}
