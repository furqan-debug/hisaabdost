
import { ScanResult, processScanResults } from '../utils/processScanUtils';
import { supabase } from '@/integrations/supabase/client';

interface ScanOptions {
  file: File | null;
  receiptUrl?: string;
  onProgress?: (progress: number, message?: string) => void;
  onTimeout?: () => void;
  onError?: (message: string) => void;
}

/**
 * Scan a receipt image using the edge function
 */
export async function scanReceipt({
  file,
  receiptUrl,
  onProgress,
  onTimeout,
  onError
}: ScanOptions): Promise<ScanResult> {
  if (!file) {
    console.error('No file provided to scanReceipt');
    if (onError) onError('No file provided');
    return { success: false, error: 'No file provided' };
  }

  console.log(`Starting receipt scan for file: ${file.name} (${file.size} bytes, type: ${file.type})`);

  try {
    if (onProgress) onProgress(10, "Preparing receipt image...");

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = `Invalid file type: ${file.type}. Please upload an image.`;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`;
      console.error(errorMsg);
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Create a form data object to send to the edge function
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', Date.now().toString());
    formData.append('retry', '0');
    formData.append('enhanced', 'true');

    console.log('FormData prepared, calling edge function...');
    if (onProgress) onProgress(20, "Analyzing receipt...");

    // Start a timer for the scan
    const scanStartTime = Date.now();
    const timeoutDuration = 25000; // 25 seconds timeout
    
    // Use Supabase client to call the edge function with proper authentication
    console.log('Invoking scan-receipt edge function...');
    const response = await supabase.functions.invoke('scan-receipt', {
      body: formData,
      headers: {
        'X-Processing-Level': 'high',
      }
    });

    console.log('Edge function response received:', response);

    // Update progress based on response status
    if (onProgress) onProgress(60, "Processing receipt text...");

    if (response.error) {
      console.error("Scan API error:", response.error);
      const errorMsg = `Server error: ${response.error.message}`;
      if (onError) onError(errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        receiptUrl
      };
    }

    try {
      const data = response.data;
      console.log("Receipt scan API response data:", data);

      if (!data) {
        const errorMsg = "No data returned from scan function";
        console.error(errorMsg);
        if (onError) onError(errorMsg);
        return { 
          success: false, 
          error: errorMsg,
          receiptUrl
        };
      }

      if (data.isTimeout) {
        console.log("Scan timed out on server");
        if (onTimeout) onTimeout();
        return { 
          success: false, 
          isTimeout: true,
          warning: data.warning || "Processing timed out",
          receiptUrl
        };
      }

      if (data.error) {
        console.error("Server returned error:", data.error);
        if (onError) onError(data.error);
        return { 
          success: false, 
          error: data.error,
          receiptUrl
        };
      }

      if (onProgress) onProgress(80, "Extracting expense information...");

      // Check if we have valid scan results
      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        console.warn("No items found in scan results, creating fallback expense");
        
        // Create a fallback expense entry
        const fallbackItem = {
          description: data.merchant || "Store Purchase",
          amount: data.total || "0.00",
          date: data.date || new Date().toISOString().split('T')[0],
          category: "Other",
          paymentMethod: "Card"
        };

        return { 
          success: true,
          date: data.date,
          merchant: data.merchant || "Store",
          items: [fallbackItem],
          total: data.total,
          receiptUrl
        };
      }

      console.log(`Scan successful! Found ${data.items.length} items`);
      if (onProgress) onProgress(100, "Receipt processed!");

      // Return success with the extracted data
      return { 
        success: true,
        date: data.date,
        merchant: data.merchant || "Store",
        items: data.items || [],
        total: data.total,
        receiptUrl
      };
    } catch (parseError) {
      console.error("Failed to parse scan response:", parseError);
      const errorMsg = "Failed to parse server response";
      if (onError) onError(errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        receiptUrl
      };
    }
  } catch (networkError) {
    console.error("Network error during scan:", networkError);
    const errorMsg = `Network error: ${networkError.message}`;
    if (onError) onError(errorMsg);
    return { 
      success: false, 
      error: errorMsg,
      receiptUrl
    };
  }
}
