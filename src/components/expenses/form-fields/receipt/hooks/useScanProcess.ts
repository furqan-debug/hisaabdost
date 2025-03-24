
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { saveExpenseFromScan } from '../services/expenseDbService';

interface UseScanProcessProps {
  updateProgress: (progress: number, message?: string) => void;
  endScan: () => void;
  timeoutScan: () => void;
  errorScan: (message: string) => void;
}

export function useScanProcess({
  updateProgress,
  endScan,
  timeoutScan,
  errorScan
}: UseScanProcessProps) {
  // Process the scan with edge function
  const processScan = useCallback(async (formData: FormData) => {
    try {
      // Start with uploading
      updateProgress(10, "Uploading receipt...");
      
      // Set a timeout to detect when scanning takes too long
      const timeoutId = setTimeout(() => {
        timeoutScan();
      }, 25000); // 25 seconds timeout
      
      try {
        // Call the Supabase function
        updateProgress(30, "Processing with OCR...");
        
        const { data, error } = await supabase.functions.invoke('scan-receipt', {
          method: 'POST',
          body: formData,
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Scan completed with error:", error);
          errorScan("We couldn't read the receipt clearly. Try a better photo or enter details manually.");
          return null;
        }
        
        // Handle missing or invalid data
        if (!data) {
          errorScan("No data was returned from the receipt scanner.");
          return null;
        }
        
        updateProgress(70, "Analyzing receipt data...");
        
        // Store the result in session storage for use
        if (data) {
          try {
            // Ensure data.items is an array
            if (!data.items || !Array.isArray(data.items)) {
              data.items = [{ name: "Store Purchase", amount: data.total || "0.00" }];
            }
            
            sessionStorage.setItem('lastScanResult', JSON.stringify(data));
            
            // Automatically add the expense to the database if results are valid
            if (data.items && data.items.length > 0) {
              updateProgress(90, "Saving expense data...");
              await saveExpenseFromScan(data);
              toast.success(`Saved ${data.items.length} expense${data.items.length > 1 ? 's' : ''}`);
            } else {
              // If no items were found, consider it a partial success
              toast.warning("Some receipt details were found, but no items were detected.");
            }
          } catch (err) {
            console.error("Error storing scan result:", err);
            errorScan("Error saving scan results. Please try again.");
            return null;
          }
        }
        
        updateProgress(100, "Scan complete!");
        
        // Mark scan as complete
        setTimeout(() => {
          endScan();
        }, 300);
        
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error; // rethrow to be caught by outer try/catch
      }
    } catch (error) {
      console.error("Error scanning receipt:", error);
      errorScan("Failed to scan receipt. Please try again or enter details manually.");
      return null;
    }
  }, [updateProgress, endScan, timeoutScan, errorScan]);

  return processScan;
}
