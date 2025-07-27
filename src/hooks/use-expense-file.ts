
import { useState, useRef } from 'react';
import { useNativeCamera } from './useNativeCamera';

export function useExpenseFile() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { takePicture } = useNativeCamera();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
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
    const file = await takePicture();
    if (file) {
      setSelectedFile(file);
      return file;
    }
    return null;
  };

  return {
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    triggerFileUpload,
    triggerCameraCapture
  };
}
