import { useState } from "react";
import { useExpenseFile } from "@/hooks/use-expense-file";
import { validateReceiptFile, showReceiptError } from "@/utils/receipt/errorHandling";
import { toast } from "sonner";

export function useReceiptCapture() {
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    fileInputRef,
    cameraInputRef,
    handleFileChange: originalHandleFileChange,
    triggerFileUpload,
    triggerCameraCapture
  } = useExpenseFile();

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return null;
    }
    
    // Validate file before processing
    const validation = validateReceiptFile(file);
    if (!validation.isValid) {
      showReceiptError(validation.error!);
      return null;
    }
    
    // Process the file through the hook
    const processedFile = originalHandleFileChange(e);
    if (processedFile) {
      setSelectedFile(processedFile);
      return processedFile;
    }
    return null;
  };

  const handleCameraCapture = async () => {
    try {
      const file = await triggerCameraCapture();
      if (file) {
        // Validate file before processing
        const validation = validateReceiptFile(file);
        if (!validation.isValid) {
          showReceiptError(validation.error!);
          return null;
        }
        
        setSelectedFile(file);
        return file;
      }
      return null;
    } catch (error) {
      console.error('Camera capture failed:', error);
      toast.error('Camera capture failed. Please try again.');
      return null;
    }
  };

  const handleUploadAction = () => {
    setCaptureMode('upload');
    triggerFileUpload();
  };

  const handleCameraAction = async () => {
    setCaptureMode('camera');
    const file = await handleCameraCapture();
    return file;
  };

  return {
    captureMode,
    setCaptureMode,
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileSelection,
    handleUploadAction,
    handleCameraAction,
    triggerFileUpload,
    triggerCameraCapture
  };
}