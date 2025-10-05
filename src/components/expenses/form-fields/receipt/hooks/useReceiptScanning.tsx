
import { useState, useCallback } from 'react';
import { useScanState } from './useScanState';
import { useScanProcess } from './useScanProcess';
import { processReceiptWithServer } from '../utils/serverProcessor';
import { processReceiptLocally, createFallbackItems } from '../utils/localProcessor';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useReceiptScanning({
  file,
  onCleanup,
  onCapture,
  setOpen,
  onSuccess
}: {
  file: File | null;
  onCleanup: () => void;
  onCapture?: (expenseDetails: any) => void;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // Use the scan state hook for managing scan progress, status, etc.
  const {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    startScan,
    updateProgress,
    endScan,
    timeoutScan,
    errorScan,
    resetState
  } = useScanState();

  // Initialize the scan process using the state management functions
  const { addExpensesToDatabase, processScan, createFileFingerprint } = useScanProcess({
    updateProgress,
    endScan,
    timeoutScan,
    errorScan
  });
  
  // Helper to process successful scan results
  const handleSuccessfulScan = useCallback(async (scanResults: {
    success: boolean;
    items?: Array<{
      description: string;
      amount: string;
      date: string;
      category: string;
      paymentMethod: string;
    }>;
    date?: string;
  }) => {
    if (!scanResults.items || scanResults.items.length === 0) {
      console.warn("No items found in scan results");
      return false;
    }
    
    updateProgress(90, `Found ${scanResults.items.length} items on receipt...`);
    
    // Add the expenses to the database
    const success = await addExpensesToDatabase(scanResults.items, updateProgress);
    
    if (success) {
      // Also call the onCapture callback for backward compatibility if needed
      if (onCapture && scanResults.items.length > 0) {
        // Use the first item as an example
        onCapture(scanResults.items[0]);
      }
      
      // Finish the scan with success message and a short delay for UI
      updateProgress(100, "Receipt processed successfully!");
      setProcessingComplete(true);
      
      // Close the scan dialog automatically after a short delay
      setTimeout(() => {
        endScan();
        if (onSuccess) {
          onSuccess();
        }
        
        // Automatically close the dialog after successful processing
        setTimeout(() => {
          setOpen(false);
          onCleanup();
        }, 1000);
      }, 1500);
      
      return true;
    }
    
    return false;
  }, [updateProgress, endScan, onCapture, onSuccess, addExpensesToDatabase, setOpen, onCleanup]);
  
  // Handle scan request with retry and enhancement logic
  const handleScanReceipt = useCallback(async () => {
    if (!file) {
      toast.error("No file selected for scanning");
      return;
    }
    
    console.log(`Starting scan of receipt: ${file.name}`);
    
    let currentFile = file;
    let attemptNumber = 1;
    const maxAttempts = 2;
    
    try {
      startScan();
      updateProgress(5, "Preparing receipt...");
      
      while (attemptNumber <= maxAttempts) {
        try {
          const attemptLabel = attemptNumber === 1 ? "original" : "enhanced";
          console.log(`📡 Attempt ${attemptNumber}/${maxAttempts}: Processing with ${attemptLabel} image`);
          
          updateProgress(attemptNumber === 1 ? 20 : 30, `Analyzing receipt (${attemptLabel})...`);
          
          const serverResults = await processReceiptWithServer({
            file: currentFile,
            onProgress: updateProgress,
            onTimeout: timeoutScan,
            onError: message => {
              console.warn(`Attempt ${attemptNumber} server error:`, message);
            }
          });
          
          // Check if we got good results
          const hasValidData = serverResults.success && 
                             serverResults.items && 
                             serverResults.items.length > 0;
          const confidence = serverResults.confidence || 0;
          const hasGoodConfidence = confidence >= 0.5;
          
          if (hasValidData && (hasGoodConfidence || attemptNumber === maxAttempts)) {
            console.log(`✅ Server processing successful (attempt ${attemptNumber}, confidence: ${confidence})`);
            const success = await handleSuccessfulScan(serverResults);
            return success;
          }
          
          // If first attempt had low confidence, try with enhanced image
          if (attemptNumber === 1 && !hasGoodConfidence && hasValidData) {
            console.log(`⚠️ Low confidence (${confidence}), retrying with enhanced image`);
            updateProgress(50, "Enhancing image for better accuracy...");
            
            // Dynamically import enhancement function
            const { enhanceReceiptImage } = await import('@/utils/receipt/imageEnhancement');
            currentFile = await enhanceReceiptImage(file, {
              enhanceContrast: true,
              sharpen: true,
              denoise: true
            });
            
            attemptNumber++;
            continue;
          }
          
          // Move to next attempt or fallback
          if (attemptNumber < maxAttempts) {
            attemptNumber++;
          } else {
            break; // Exit to try local processing
          }
          
        } catch (serverError) {
          console.error(`Attempt ${attemptNumber} failed:`, serverError);
          
          if (attemptNumber < maxAttempts) {
            updateProgress(50, "Enhancing image...");
            const { enhanceReceiptImage } = await import('@/utils/receipt/imageEnhancement');
            currentFile = await enhanceReceiptImage(file, {
              enhanceContrast: true,
              sharpen: true,
              denoise: true
            });
            attemptNumber++;
          } else {
            break; // Exit to try local processing
          }
        }
      }
      
      // Try local processing as final fallback
      console.log("Attempting local processing as fallback...");
      updateProgress(60, "Using local recognition...");
      
      try {
        const localResults = await processReceiptLocally({
          file: currentFile,
          onProgress: updateProgress,
          onError: errorScan
        });
        
        if (localResults.success && localResults.items && localResults.items.length > 0) {
          console.log("Local processing successful:", localResults);
          const success = await handleSuccessfulScan(localResults);
          return success;
        }
        
        // Use fallback items as last resort
        const fallbackData = {
          success: true,
          items: createFallbackItems({ date: localResults.date }),
          date: localResults.date || new Date().toISOString().split('T')[0]
        };
        
        const success = await handleSuccessfulScan(fallbackData);
        if (!success) {
          errorScan("Failed to add items to your expenses");
        }
        return success;
        
      } catch (localError) {
        console.error("Local processing failed:", localError);
        errorScan("Unable to process receipt. Please try a clearer photo.");
        return false;
      }
      
    } catch (error) {
      console.error("Receipt scanning error:", error);
      errorScan("An unexpected error occurred while scanning");
      return false;
    }
  }, [file, startScan, updateProgress, timeoutScan, errorScan, handleSuccessfulScan]);

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    processingComplete,
    resetScanState: resetState
  };
}
