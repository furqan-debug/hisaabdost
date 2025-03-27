
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
  
  const processScan = useCallback(async (formData: FormData) => {
    try {
      updateProgress(10, "Preparing receipt for OCR...");
      
      const timeoutId = setTimeout(() => {
        timeoutScan();
      }, 45000);
      
      try {
        updateProgress(30, "Processing with OCR...");
        
        formData.append('timestamp', Date.now().toString());
        
        const { data, error } = await supabase.functions.invoke('scan-receipt', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Processing-Level': 'high',
          }
        });
        
        clearTimeout(timeoutId);
        
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
          // Merchant field has been removed
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
