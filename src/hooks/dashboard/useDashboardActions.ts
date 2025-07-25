
import { useRef, useState } from "react";
import { useExpenseFile } from "@/hooks/use-expense-file";

export function useDashboardActions() {
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  
  const {
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    triggerFileUpload,
    triggerCameraCapture
  } = useExpenseFile();

  const handleAddExpense = () => {
    console.log('Dashboard: handleAddExpense called');
    setCaptureMode('manual');
    return 'manual';
  };

  const handleUploadReceipt = () => {
    console.log('Dashboard: handleUploadReceipt called');
    setCaptureMode('upload');
    triggerFileUpload();
    return 'upload';
  };

  const handleTakePhoto = () => {
    console.log('Dashboard: handleTakePhoto called');
    setCaptureMode('camera');
    triggerCameraCapture();
    return 'camera';
  };

  const handleAddBudget = () => {
    console.log('Dashboard: handleAddBudget called - navigating to budget page');
    // Use proper navigation
    window.location.href = '/app/budget';
  };

  return {
    captureMode,
    setCaptureMode,
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    handleAddExpense,
    handleUploadReceipt,
    handleTakePhoto,
    handleAddBudget
  };
}
