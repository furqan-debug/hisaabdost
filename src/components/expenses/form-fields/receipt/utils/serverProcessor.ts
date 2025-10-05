
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServerScanOptions {
  file: File;
  onProgress?: (progress: number, message?: string) => void;
  onTimeout?: () => void;
  onError?: (error: string) => void;
}

interface ServerScanResult {
  success: boolean;
  items?: Array<{
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }>;
  date?: string;
  total?: string;
  receiptUrl?: string;
  error?: string;
  isTimeout?: boolean;
  confidence?: number;
}

/**
 * Process a receipt using the server-side OCR function
 */
export async function processReceiptWithServer({
  file,
  onProgress,
  onTimeout,
  onError
}: ServerScanOptions): Promise<ServerScanResult> {
  if (!file) {
    const errorMsg = "No file provided";
    console.error(errorMsg);
    if (onError) onError(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  console.log(`Processing receipt with server: ${file.name} (${file.size} bytes, type: ${file.type})`);
  
  try {
    onProgress?.(30, "Processing with server OCR...");
    
    // Create form data for the request
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata to help with debugging
    formData.append('timestamp', Date.now().toString());
    formData.append('retry', '0'); // Initial attempt
    formData.append('enhanced', 'true');
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('scan-receipt', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Processing-Level': 'high',
      }
    });
    
    if (error) {
      console.error("Server processing error:", error);
      throw new Error(`Server processing error: ${error.message || 'Unknown error'}`);
    }
    
    if (!data) {
      throw new Error("No data returned from scan function");
    }
    
    console.log("Server scan response:", data);
    
    // Check for timeout in the response
    if (data.isTimeout === true) {
      console.log("Scan timed out on server side");
      
      if (onTimeout) onTimeout();
      
      // Return any partial results if available
      if (data.items?.length > 0) {
        console.log("Using partial data despite timeout:", data);
        return {
          success: true,
          items: data.items,
          date: data.date || new Date().toISOString().split('T')[0],
          total: data.total,
          isTimeout: true
        };
      }
      
      return { 
        success: false, 
        isTimeout: true, 
        error: "Processing timed out",
        date: data.date || new Date().toISOString().split('T')[0],
      };
    }
    
    // Process the data
    const processedData = {
      success: true,
      items: Array.isArray(data.items) ? data.items : [],
      date: data.date || new Date().toISOString().split('T')[0],
      total: data.total || "0.00",
      confidence: data.confidence
    };
    
    // Display warnings but continue with processing
    if (data.warning) {
      console.warn("Scan completed with warning:", data.warning);
      toast.warning(data.warning || "Receipt processed with limited accuracy");
    }
    
    return processedData;
    
  } catch (error) {
    console.error("Error in server processing:", error);
    if (onError) onError(error instanceof Error ? error.message : "Server processing failed");
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Server processing failed" 
    };
  }
}
