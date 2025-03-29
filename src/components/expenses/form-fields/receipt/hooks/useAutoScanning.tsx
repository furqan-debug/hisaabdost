
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export function useAutoScanning({
  file,
  handleScanReceipt
}: {
  file: File | null;
  handleScanReceipt: () => Promise<boolean | undefined>;
}) {
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);

  // Auto-process receipt without requiring user to click scan button
  const autoProcessReceipt = useCallback(() => {
    if (!file) {
      console.error("Cannot auto-process: No file provided");
      return;
    }
    
    setIsAutoProcessing(true);
    
    // Slight delay to allow UI to update
    setTimeout(async () => {
      try {
        const success = await handleScanReceipt();
        // Process all receipt items and add them to expenses, 
        // no need for manual processing option
        if (!success) {
          console.error("Auto-processing failed");
        }
      } finally {
        setIsAutoProcessing(false);
      }
    }, 100);
  }, [file, handleScanReceipt]);

  return {
    isAutoProcessing,
    autoProcessReceipt
  };
}
