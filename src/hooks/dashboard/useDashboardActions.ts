
import { useNavigate } from "react-router-dom";
import { useReceiptCapture } from "@/hooks/useReceiptCapture";

export function useDashboardActions() {
  const navigate = useNavigate();
  
  const {
    captureMode,
    setCaptureMode,
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileSelection,
    handleUploadAction,
    handleCameraAction
  } = useReceiptCapture();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = handleFileSelection(e);
    if (file) {
      // Dispatch event to open expense form with upload mode
      window.dispatchEvent(new CustomEvent('open-expense-form', { 
        detail: { mode: 'upload', file: file } 
      }));
    }
    return file;
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerCameraCapture = async () => {
    const file = await handleCameraAction();
    if (file) {
      // Dispatch event to open expense form with camera mode
      window.dispatchEvent(new CustomEvent('open-expense-form', { 
        detail: { mode: 'camera', file: file } 
      }));
    }
    return file;
  };

  const handleAddExpense = () => {
    console.log('Dashboard: handleAddExpense called');
    setCaptureMode('manual');
    window.dispatchEvent(new CustomEvent('open-expense-form', { 
      detail: { mode: 'manual' }
    }));
    return 'manual';
  };

  const handleUploadReceipt = () => {
    console.log('Dashboard: handleUploadReceipt called - using same logic as expenses page');
    setCaptureMode('upload');
    // Directly trigger file upload like expenses page
    handleUploadAction();
    return 'upload';
  };

  const handleTakePhoto = async () => {
    console.log('Dashboard: handleTakePhoto called - using same logic as expenses page');
    setCaptureMode('camera');
    // Use the same logic as expenses page camera button
    const file = await handleCameraAction();
    if (file) {
      // Dispatch event to open expense form with camera mode
      window.dispatchEvent(new CustomEvent('open-expense-form', { 
        detail: { mode: 'camera', file: file } 
      }));
    }
    return 'camera';
  };

  const handleAddBudget = () => {
    console.log('Dashboard: handleAddBudget called - navigating to budget page');
    navigate('/app/budget');
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
    handleAddBudget,
    triggerCameraCapture,
    triggerFileUpload
  };
}
