
import { useEffect, useState } from 'react';

interface UseDialogCleanupProps {
  open: boolean;
  onCleanup: () => void;
}

export function useDialogCleanup({ open, onCleanup }: UseDialogCleanupProps) {
  const [hasCleanedUp, setHasCleanedUp] = useState(false);

  // Handle dialog close - only allow closing when not processing
  const handleClose = (isScanning: boolean, isAutoProcessing: boolean) => {
    if (!isScanning && !isAutoProcessing) {
      console.log("Closing receipt dialog, cleaning up resources");
      
      // Call onCleanup only if not already called
      if (!hasCleanedUp) {
        // Add a small delay before cleaning up to make sure we're not still using the resources
        setTimeout(() => {
          onCleanup();
        }, 300);
        setHasCleanedUp(true);
      }
      
      return true;
    }
    return false;
  };
  
  // Cleanup when dialog is closed but component isn't unmounted
  useEffect(() => {
    if (!open && !hasCleanedUp) {
      // Add a delay before cleanup
      const timer = setTimeout(() => {
        console.log("Automatic cleanup triggered for closed dialog");
        onCleanup();
        setHasCleanedUp(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, onCleanup, hasCleanedUp]);

  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      setHasCleanedUp(false);
    }
  }, [open]);

  return {
    hasCleanedUp,
    setHasCleanedUp,
    handleClose
  };
}
