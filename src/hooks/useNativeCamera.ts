import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function useNativeCamera() {
  const capturePhoto = async (): Promise<File | null> => {
    try {
      console.log('Starting camera capture...');
      
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'Take Receipt Photo',
        promptLabelCancel: 'Cancel',
        promptLabelPhoto: 'From Camera',
      });

      if (!photo.dataUrl) {
        console.log('No photo data received');
        return null;
      }

      console.log('Photo captured, converting to file...');
      
      // Convert base64 to blob
      const base64Response = await fetch(photo.dataUrl);
      const blob = await base64Response.blob();
      
      // Create file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `receipt-${timestamp}.jpg`;
      
      const file = new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      console.log(`Photo file created: ${fileName}, size: ${file.size} bytes`);
      return file;
      
    } catch (error) {
      console.error('Camera capture failed:', error);
      if (error.message?.includes('User cancelled')) {
        console.log('User cancelled camera');
      }
      return null;
    }
  };

  return { capturePhoto };
}