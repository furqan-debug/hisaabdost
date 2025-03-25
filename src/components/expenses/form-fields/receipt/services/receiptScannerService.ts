
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
    
    // Report progress at start
    onProgress?.(10, "Preparing receipt for scanning...");
    
    // Make the API request to the Supabase Edge Function
    const response = await fetch('https://skmzvfihekgmxtjcsdmg.supabase.co/functions/v1/scan-receipt', {
      method: 'POST',
      body: formData,
    });
    
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
      return { success: false, error: errorText || "Failed to scan receipt" };
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
    
    onProgress?.(90, "Finalizing results...");
    
    // If we have a stored receipt URL, add it to each item
    if (receiptUrl && result.items) {
      result.items = result.items.map((item: any) => ({
        ...item,
        receiptUrl
      }));
    }
    
    onProgress?.(100, "Scan complete!");
    
    return {
      success: true,
      items: result.items || [],
      merchant: result.merchant || result.storeName,
      date: result.date,
      error: result.error
    };
  } catch (error) {
    console.error("Error in scanReceipt:", error);
    onError?.(error instanceof Error ? error.message : "Unknown error occurred");
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
