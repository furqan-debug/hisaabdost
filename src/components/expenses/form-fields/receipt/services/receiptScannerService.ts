
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

    if (onProgress) onProgress(20, "Analyzing receipt...");

    // Use Supabase functions.invoke method instead of direct fetch
    console.log('Invoking scan-receipt edge function via Supabase...');
    
    // Convert file to base64 for edge function
    const fileBuffer = await file.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    
    const { data, error } = await supabase.functions.invoke('scan-receipt', {
      body: {
        file: base64File,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        timestamp: Date.now()
      }
    });

    console.log('Edge function response received:', { data, error });

    // Update progress based on response status
    if (onProgress) onProgress(60, "Processing receipt text...");

    if (error) {
      console.error("Scan API error:", error);
      const errorMsg = `Server error: ${error.message || 'Unknown error'}`;
      if (onError) onError(errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        receiptUrl
      };
    }

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
