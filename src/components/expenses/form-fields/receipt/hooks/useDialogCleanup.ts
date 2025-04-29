import { useEffect, useState, useCallback, useRef } from 'react';
import { cleanupUnusedBlobUrls, forceCleanupAllBlobUrls } from '@/utils/blobManager';

interface UseDialogCleanupProps {
  open: boolean;
  onCleanup: () => void;
}

export function useDialogCleanup({ open, onCleanup }: UseDialogCleanupProps) {
  const [hasCleanedUp, setHasCleanedUp] = useState(false);
  const prevOpenRef = useRef(open);
  const cleanupAttempts = useRef(0);
  const dialogMountTime = useRef(Date.now());
  
  // Reset counter when dialog opens
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      cleanupAttempts.current = 0;
      dialogMountTime.current = Date.now();
      setHasCleanedUp(false);
    }
  }, [open]);
  
  // Dedicated cleanup function with retry logic
  const performCleanup = useCallback(() => {
    if (hasCleanedUp && cleanupAttempts.current > 0) {
      console.log("Cleanup already performed, skipping");
      return;
    }
    
    cleanupAttempts.current += 1;
    console.log(`Performing dialog cleanup (attempt ${cleanupAttempts.current})`);
    
    try {
      // Call the provided cleanup function
      onCleanup();
      
      // Also clean up any unused blob URLs
      setTimeout(() => {
        cleanupUnusedBlobUrls();
      }, 500);
      
      setHasCleanedUp(true);
    } catch (error) {
      console.error("Error during dialog cleanup:", error);
      
      // If we've tried a few times and still failed, try emergency cleanup
      if (cleanupAttempts.current >= 3) {
        console.warn("Multiple cleanup attempts failed, trying emergency cleanup");
        setTimeout(() => {
          forceCleanupAllBlobUrls();
        }, 1000);
      }
    }
  }, [hasCleanedUp, onCleanup]);

  // Handle dialog close - only allow closing when not processing
  const handleClose = useCallback((isScanning: boolean, isAutoProcessing: boolean) => {
    if (!isScanning && !isAutoProcessing) {
      console.log("Closing receipt dialog, cleaning up resources");
      
      // Add a small delay before cleaning up to make sure we're not still using the resources
      setTimeout(() => {
        performCleanup();
      }, 500);
      
      return true;
    }
    return false;
  }, [performCleanup]);
  
  // Cleanup when dialog is closed but component isn't unmounted
  useEffect(() => {
    // Only run when dialog transitions from open to closed
    if (prevOpenRef.current && !open) {
      // Track the state change
      console.log("Dialog closed, scheduling cleanup");
      
      // Add a delay before cleanup
      const timer = setTimeout(() => {
        performCleanup();
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    prevOpenRef.current = open;
  }, [open, performCleanup]);

  // Cleanup on unmount as a safety measure
  useEffect(() => {
    return () => {
      // If the component unmounts without cleaning up, force cleanup
      if (!hasCleanedUp) {
        console.log("Dialog component unmounting, forcing cleanup");
        performCleanup();
        
        // As a last resort, use emergency cleanup
        setTimeout(() => {
          forceCleanupAllBlobUrls();
        }, 1000);
      }
    };
  }, [hasCleanedUp, performCleanup]);

  return {
    hasCleanedUp,
    setHasCleanedUp,
    handleClose,
    performCleanup
  };
}
