import { useState, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { toast } from 'sonner';

export interface AttachedFile {
  file: File;
  preview: string;
  id: string;
}

export function useFileAttachment() {
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createFileAttachment = (file: File): AttachedFile => {
    const preview = URL.createObjectURL(file);
    return {
      file,
      preview,
      id: Date.now().toString(),
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Remove existing attachment
    removeAttachment();

    // Create new attachment
    const attachment = createFileAttachment(file);
    setAttachedFile(attachment);
    setShowAttachmentOptions(false);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'Take Photo',
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'From Camera',
      });

      if (!photo.dataUrl) {
        return;
      }

      // Convert base64 to blob
      const base64Response = await fetch(photo.dataUrl);
      const blob = await base64Response.blob();

      // Create file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `photo-${timestamp}.jpg`;

      const file = new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Remove existing attachment
      removeAttachment();

      // Create new attachment
      const attachment = createFileAttachment(file);
      setAttachedFile(attachment);
      setShowAttachmentOptions(false);

    } catch (error) {
      console.error('Camera capture failed:', error);
      if (!error.message?.includes('User cancelled')) {
        toast.error('Failed to capture photo');
      }
    }
  };

  const removeAttachment = () => {
    if (attachedFile) {
      URL.revokeObjectURL(attachedFile.preview);
      setAttachedFile(null);
    }
  };

  const toggleAttachmentOptions = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };

  return {
    attachedFile,
    showAttachmentOptions,
    fileInputRef,
    handleFileSelect,
    handleCameraCapture,
    removeAttachment,
    toggleAttachmentOptions,
  };
}