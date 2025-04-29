
import { useEffect, useState, useCallback, useRef } from 'react';
import { cleanupUnusedBlobUrls } from '@/utils/blobUrlManager';

interface UseDialogCleanupProps {
  open: boolean;
  onCleanup: () => void;
}

export function useDialogCleanup({ open, onCleanup }: UseDialogCleanupProps) {
  const [hasCleanedUp, setHasCleanedUp] = useState(false);
  const prevOpenRef = useRef(open);

  // Handle dialog close - only allow closing when not processing
  const handleClose = useCallback((isScanning: boolean, isAutoProcessing: boolean) => {
    if (!isScanning && !isAutoProcessing) {
      console.log("Closing receipt dialog, cleaning up resources");
      
      // Call onCleanup only if not already called
      if (!hasCleanedUp) {
        // Add a small delay before cleaning up to make sure we're not still using the resources
        setTimeout(() => {
          onCleanup();
          
          // Also clean up any unused blob URLs
          cleanupUnusedBlobUrls();
        }, 300);
        setHasCleanedUp(true);
      }
      
      return true;
    }
    return false;
  }, [hasCleanedUp, onCleanup]);
  
  // Cleanup when dialog is closed but component isn't unmounted
  useEffect(() => {
    // Only run when dialog transitions from open to closed
    if (prevOpenRef.current && !open) {
      // Add a delay before cleanup
      const timer = setTimeout(() => {
        if (!hasCleanedUp) {
          console.log("Automatic cleanup triggered for closed dialog");
          onCleanup();
          cleanupUnusedBlobUrls();
          setHasCleanedUp(true);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    prevOpenRef.current = open;
  }, [open, onCleanup, hasCleanedUp]);

  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      setHasCleanedUp(false);
    }
  }, [open]);

  // Cleanup on unmount as a safety measure
  useEffect(() => {
    return () => {
      if (!hasCleanedUp) {
        console.log("Dialog component unmounting, forcing cleanup");
        onCleanup();
        cleanupUnusedBlobUrls();
      }
    };
  }, [onCleanup, hasCleanedUp]);

  return {
    hasCleanedUp,
    setHasCleanedUp,
    handleClose
  };
}
