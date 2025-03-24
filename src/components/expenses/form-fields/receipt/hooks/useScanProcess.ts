
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { saveExpenseFromScan } from '../services/expenseDbService';

interface UseScanProcessProps {
  updateProgress: (progress: number, message?: string) => void;
  endScan: () => void;
  timeoutScan: () => void;
}

export function useScanProcess({
  updateProgress,
  endScan,
  timeoutScan
}: UseScanProcessProps) {
  // Process the scan with edge function
  const processScan = useCallback(async (formData: FormData) => {
    try {
      updateProgress(30, "Processing with OCR...");
      
      // Set a timeout to detect when scanning takes too long
      const timeoutId = setTimeout(() => {
        timeoutScan();
      }, 20000); // 20 seconds timeout
      
      // Call the Supabase function
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        method: 'POST',
        body: formData,
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.warn("Scan completed with error:", error);
        toast.error("Couldn't read receipt clearly. Please enter details manually.");
        endScan();
        return null;
      }
      
      // Store the result in session storage for use
      if (data) {
        try {
          sessionStorage.setItem('lastScanResult', JSON.stringify(data));
          
          // Automatically add the expense to the database if results are valid
          if (data.items && data.items.length > 0) {
            await saveExpenseFromScan(data);
          }
        } catch (err) {
          console.error("Error storing scan result:", err);
        }
      }
      
      updateProgress(100, "Scan complete!");
      
      // Mark scan as complete
      setTimeout(() => {
        endScan();
      }, 300);
      
      return data;
    } catch (error) {
      console.error("Error scanning receipt:", error);
      endScan();
      toast.error("Failed to scan receipt. Please try again or enter details manually.");
      return null;
    }
  }, [updateProgress, endScan, timeoutScan]);

  return processScan;
}
