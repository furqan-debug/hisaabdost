
import { toast } from "sonner";

interface ScanReceiptOptions {
  file: File;
  receiptUrl?: string;
  onProgress?: (progress: number, message?: string) => void;
  onTimeout?: () => void;
  onError?: (error: string) => void;
}

interface ScanResult {
  success: boolean;
  items?: Array<{
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
    receiptUrl?: string | null;
  }>;
  merchant?: string;
  date?: string;
  error?: string;
  isTimeout?: boolean;
}

export async function scanReceipt({
  file,
  receiptUrl,
  onProgress,
  onTimeout,
  onError
}: ScanReceiptOptions): Promise<ScanResult> {
  if (!file) {
    return { success: false, error: "No file provided" };
  }
  
  try {
    console.log(`Starting receipt scan for ${file.name} (${file.size} bytes)`);
    
    // Create form data for the request
    const formData = new FormData();
    formData.append('receipt', file);
    
    // If we have a stored receipt URL, add it to the form data
    if (receiptUrl) {
      formData.append('receiptUrl', receiptUrl);
    }
    
    // Add enhanced processing flag
    formData.append('enhanced', 'true');
    
    // Add a timestamp to prevent caching
    formData.append('timestamp', Date.now().toString());
    
    // Report progress at start
    onProgress?.(10, "Preparing receipt for scanning...");
    
    // Set up abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn("Receipt scan request timed out");
    }, 60000); // 60 second timeout
    
    // Make the API request to the Supabase Edge Function
    const response = await fetch('https://skmzvfihekgmxtjcsdmg.supabase.co/functions/v1/scan-receipt', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        // No custom headers needed as FormData sets the content-type automatically
      }
    }).catch(error => {
      // Check if the error is due to timeout/abort
      if (error.name === 'AbortError') {
        throw new Error("Request timed out");
      }
      throw error;
    });
    
    // Clear the timeout since we got a response
    clearTimeout(timeoutId);
    
    onProgress?.(30, "Processing receipt image...");
    
    // Check for timeout response status
    if (response.status === 408) {
      console.error("Receipt scanning timed out");
      onTimeout?.();
      return { success: false, isTimeout: true, error: "Processing timed out" };
    }
    
    // Check for other error status codes
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error scanning receipt: ${response.status}`, errorText);
      onError?.(errorText || "Failed to scan receipt");
      return { success: false, error: errorText || `Failed to scan receipt (Status: ${response.status})` };
    }
    
    onProgress?.(60, "Extracting data from receipt...");
    
    // Parse the JSON response
    const result = await response.json();
    console.log("Receipt scan result:", result);
    
    // Check if the response indicates a timeout
    if (result.isTimeout) {
      console.error("Receipt scanning timed out (from response data)");
      onTimeout?.();
      return { success: false, isTimeout: true, error: "Processing timed out" };
    }
    
    // Handle error from the response
    if (result.error) {
      console.error("Error in scan result:", result.error);
      onError?.(result.error);
      return { 
        success: false, 
        error: result.error,
        // Still include any partial data that might have been extracted
        items: result.items || [],
        merchant: result.merchant || result.storeName,
        date: result.date
      };
    }
    
    onProgress?.(90, "Finalizing results...");
    
    // If we have a stored receipt URL, add it to each item
    if (receiptUrl && result.items) {
      result.items = result.items.map((item: any) => ({
        ...item,
        receiptUrl
      }));
    }
    
    // Create fallback item if no items were found
    if (!result.items || result.items.length === 0) {
      const fallbackItem = {
        description: result.merchant || result.storeName || "Store Purchase",
        amount: result.total || "0.00",
        date: result.date || new Date().toISOString().split('T')[0],
        category: "Other",
        paymentMethod: "Card",
        receiptUrl: receiptUrl
      };
      
      result.items = [fallbackItem];
      console.log("Using fallback item:", fallbackItem);
    }
    
    onProgress?.(100, "Scan complete!");
    
    return {
      success: true,
      items: result.items || [],
      merchant: result.merchant || result.storeName,
      date: result.date,
      error: result.warning // Use warning as non-fatal error
    };
  } catch (error) {
    console.error("Error in scanReceipt:", error);
    
    // Check for network errors which might be causing "Failed to fetch"
    const errorMessage = error instanceof Error 
      ? (error.name === 'TypeError' && error.message.includes('fetch') 
          ? "Network error: Please check your internet connection and try again"
          : error.message)
      : "Unknown error occurred";
      
    onError?.(errorMessage);
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}
