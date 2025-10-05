
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
        detail: { mode: captureMode, file: file } 
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
    console.log('Dashboard: handleUploadReceipt called - opening file picker');
    setCaptureMode('upload');
    // Trigger file input click to open file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTakePhoto = async () => {
    console.log('Dashboard: handleTakePhoto called - opening camera');
    setCaptureMode('camera');
    // Trigger camera input or use native camera
    const file = await handleCameraAction();
    if (file) {
      // File captured successfully, dispatch event to open expense form
      window.dispatchEvent(new CustomEvent('open-expense-form', { 
        detail: { mode: 'camera', file: file } 
      }));
    }
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
    handleAddBudget
  };
}
