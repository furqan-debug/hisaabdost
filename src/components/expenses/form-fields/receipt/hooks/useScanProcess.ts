
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseScanProcessProps {
  updateProgress: (progress: number, message?: string) => void;
  endScan: () => void;
  timeoutScan: () => void;
  errorScan: (message: string) => void;
}

// Track ongoing scans to prevent duplicates
const ongoingScans = new Map<string, boolean>();

export function useScanProcess({
  updateProgress,
  endScan,
  timeoutScan,
  errorScan
}: UseScanProcessProps) {
  
  const processScan = useCallback(async (formData: FormData) => {
    try {
      // Generate a unique ID for this scan request based on timestamp
      const scanId = formData.get('timestamp')?.toString() || Date.now().toString();
      
      // Check if this scan is already in progress
      if (ongoingScans.has(scanId)) {
        console.log(`Scan with ID ${scanId} is already in progress, aborting duplicate`);
        return null;
      }
      
      // Track this scan
      ongoingScans.set(scanId, true);
      
      try {
        updateProgress(10, "Preparing receipt for OCR...");
        
        const timeoutId = setTimeout(() => {
          timeoutScan();
          ongoingScans.delete(scanId);
        }, 45000);
        
        try {
          updateProgress(30, "Processing with OCR...");
          
          // We want to ensure unique timestamps to avoid duplicate scans
          const uniqueTimestamp = Date.now().toString();
          formData.set('timestamp', uniqueTimestamp);
          
          // IMPORTANT: DO NOT manually set the Content-Type header for multipart/form-data
          // Let the browser/fetch API handle it automatically to include the boundary parameter
          const { data, error } = await supabase.functions.invoke('scan-receipt', {
            method: 'POST',
            body: formData,
            headers: {
              'X-Processing-Level': 'high',
            }
          });
          
          clearTimeout(timeoutId);
          ongoingScans.delete(scanId);
          
          if (data?.isTimeout === true) {
            console.error("Scan timed out on server side");
            timeoutScan();
            
            if (data?.items?.length > 0) {
              console.log("Using fallback data despite timeout:", data);
              return {
                success: true,
                ...data
              };
            }
            
            return null;
          }
          
          if (error) {
            console.error("Scan error:", error);
            errorScan("Failed to process receipt. Please try again or use manual entry.");
            return null;
          }
          
          if (!data) {
            errorScan("No data was returned from the receipt scanner.");
            return null;
          }
          
          console.log("Raw scan data received:", data);
          updateProgress(70, "Analyzing receipt data...");
          
          if (data.error || data.warning) {
            console.warn("Scan completed with warning:", data.error || data.warning);
            toast.warning(data.warning || "Receipt processed with limited accuracy");
          }
          
          const processedData = {
            success: true,
            items: Array.isArray(data.items) ? data.items : [],
            date: data.date || new Date().toISOString().split('T')[0],
            total: data.total || "0.00",
            receiptUrl: data.receiptUrl
          };
          
          if (!processedData.items || processedData.items.length === 0) {
            processedData.items = [{ 
              name: "Store Purchase", 
              amount: processedData.total || "0.00",
              date: processedData.date
            }];
          }
          
          sessionStorage.setItem('lastScanResult', JSON.stringify(processedData));
          console.log("Stored scan result:", processedData);
          
          updateProgress(100, "Receipt processed successfully!");
          
          setTimeout(() => {
            endScan();
          }, 300);
          
          return processedData;
          
        } catch (error) {
          clearTimeout(timeoutId);
          ongoingScans.delete(scanId);
          throw error;
        }
      } catch (error) {
        ongoingScans.delete(scanId);
        throw error;
      }
    } catch (error) {
      console.error("Error scanning receipt:", error);
      errorScan("Failed to scan receipt. Please try again or enter details manually.");
      return null;
    }
  }, [updateProgress, endScan, timeoutScan, errorScan]);

  return processScan;
}
