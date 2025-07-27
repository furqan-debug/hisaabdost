import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function useNativeCamera() {
  const takePicture = async (): Promise<File | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        // Convert the image to a File object
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        return file;
      }
      return null;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  };

  return { takePicture };
}