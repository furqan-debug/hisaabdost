
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
  const [processingTriggered, setProcessingTriggered] = useState(false);

  // Auto-process receipt without requiring user to click scan button
  const autoProcessReceipt = useCallback(() => {
    if (!file) {
      console.error("Cannot auto-process: No file provided");
      return;
    }
    
    if (processingTriggered) {
      console.log("Auto-processing already triggered for this file, skipping");
      return;
    }
    
    setIsAutoProcessing(true);
    setProcessingTriggered(true);
    
    console.log(`Auto-processing receipt: ${file.name}`);
    
    // Slight delay to allow UI to update
    setTimeout(async () => {
      try {
        const success = await handleScanReceipt();
        if (success) {
          console.log("Auto-processing succeeded");
        } else {
          console.error("Auto-processing failed");
        }
      } catch (error) {
        console.error("Error during auto-processing:", error);
      } finally {
        setIsAutoProcessing(false);
      }
    }, 100);
  }, [file, handleScanReceipt, processingTriggered]);

  // Automatically start processing when a file is provided
  useEffect(() => {
    if (file && !processingTriggered) {
      console.log("File detected, triggering auto-processing");
      autoProcessReceipt();
    }
  }, [file, autoProcessReceipt, processingTriggered]);

  return {
    isAutoProcessing,
    autoProcessReceipt,
    resetProcessingState: () => setProcessingTriggered(false)
  };
}
