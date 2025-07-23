
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
    
    // Dispatch custom event to trigger expense form
    const customEvent = new CustomEvent('open-expense-form', {
      detail: { mode: 'manual' }
    });
    window.dispatchEvent(customEvent);
    
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
    // Use React Router for navigation
    window.history.pushState({}, '', '/app/budget');
    window.dispatchEvent(new PopStateEvent('popstate'));
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
