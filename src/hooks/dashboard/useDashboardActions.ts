
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
    console.log('Dashboard: handleUploadReceipt called - navigating to expenses page with auto-expand');
    navigate('/app/expenses?expand=upload');
  };

  const handleTakePhoto = async () => {
    console.log('Dashboard: handleTakePhoto called - navigating to expenses page with auto-expand');
    navigate('/app/expenses?expand=camera');
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
