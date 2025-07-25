
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenseFile } from "@/hooks/use-expense-file";

export function useDashboardActions() {
  const navigate = useNavigate();
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
