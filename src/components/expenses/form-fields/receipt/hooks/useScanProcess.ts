
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
      updateProgress(10, "Preparing receipt for OCR...");
      
      // Set a timeout to detect when scanning takes too long
      const timeoutId = setTimeout(() => {
        timeoutScan();
      }, 45000); // Extend timeout to 45 seconds for more complex receipts
      
      try {
        // Call the Supabase function
        updateProgress(30, "Processing with OCR...");
        
        // Add a timestamp to prevent caching issues with identical receipts
        formData.append('timestamp', Date.now().toString());
        
        const { data, error } = await supabase.functions.invoke('scan-receipt', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Processing-Level': 'high', // Signal more intensive processing
          }
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Scan completed with error:", error);
          errorScan("We couldn't read the receipt clearly. Try again or use manual entry.");
          return null;
        }
        
        // Handle missing or invalid data
        if (!data) {
          errorScan("No data was returned from the receipt scanner.");
          return null;
        }
        
        console.log("Raw scan data received:", data);
        updateProgress(70, "Analyzing receipt data...");
        
        // Process the data to ensure it has the expected structure
        const processedData = {
          items: Array.isArray(data.items) ? data.items : [],
          merchant: data.storeName || data.merchant || "Store",
          date: data.date || new Date().toISOString().split('T')[0],
          total: data.total || "0.00"
        };
        
        // Ensure items array exists and has at least one entry
        if (!processedData.items || processedData.items.length === 0) {
          // Add a fallback item if none were detected
          processedData.items = [{ 
            name: processedData.merchant ? `Purchase from ${processedData.merchant}` : "Store Purchase", 
            amount: processedData.total || "0.00",
            date: processedData.date
          }];
        }
        
        // Store result for usage after scan completes
        sessionStorage.setItem('lastScanResult', JSON.stringify(processedData));
        console.log("Stored scan result:", processedData);
        
        // Mark scan as complete
        updateProgress(100, "Receipt processed successfully!");
        
        // Complete scan after a short delay to show the success state
        setTimeout(() => {
          endScan();
        }, 300);
        
        return processedData;
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
