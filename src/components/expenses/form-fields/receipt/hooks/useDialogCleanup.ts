
import { useCallback } from 'react';

interface UseDialogCleanupProps {
  open: boolean;
  onCleanup: () => void;
}

export function useDialogCleanup({
  open,
  onCleanup
}: UseDialogCleanupProps) {
  // Handle dialog close with confirmation if processing
  const handleClose = useCallback((isScanning: boolean, isAutoProcessing: boolean) => {
    // Check if we're in the middle of scanning/processing
    if (isScanning || isAutoProcessing) {
      const shouldClose = confirm(
        "Receipt scanning is in progress. Closing now will cancel the process. Are you sure you want to close?"
      );
      
      if (!shouldClose) {
        return false;
      }
    }
    
    // If we're not open, or user confirmed close, cleanup
    if (!open || (isScanning || isAutoProcessing)) {
      console.log("Cleaning up resources in dialog");
      onCleanup();
    }
    
    return true;
  }, [open, onCleanup]);
  
  return { handleClose };
}
