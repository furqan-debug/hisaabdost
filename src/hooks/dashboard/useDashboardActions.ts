
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNativeCamera } from "../useNativeCamera";

export function useDashboardActions() {
  const navigate = useNavigate();
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
  const { capturePhoto } = useNativeCamera();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Dashboard: File selected:', file.name);
      setSelectedFile(file);
      
      // Reset the input value to allow selecting the same file again
      if (e.target) {
        e.target.value = '';
      }
      
      return file;
    }
    return null;
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerCameraCapture = async () => {
    console.log('Dashboard: Triggering native camera capture...');
    const file = await capturePhoto();
    if (file) {
      console.log('Dashboard: Camera capture successful, setting file:', file.name);
      setSelectedFile(file);
      return file;
    }
    console.log('Dashboard: Camera capture failed or cancelled');
    return null;
  };

  const handleAddExpense = () => {
    console.log('Dashboard: handleAddExpense called');
    setCaptureMode('manual');
    return 'manual';
  };

  const handleUploadReceipt = () => {
    console.log('Dashboard: handleUploadReceipt called');
    setCaptureMode('upload');
    // Trigger file upload directly
    triggerFileUpload();
    return 'upload';
  };

  const handleTakePhoto = async () => {
    console.log('Dashboard: handleTakePhoto called - directly opening camera');
    setCaptureMode('camera');
    
    // Directly capture photo
    const file = await triggerCameraCapture();
    if (file) {
      setSelectedFile(file);
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
