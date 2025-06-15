
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
  console.log(`🔍 ReceiptScanner: Starting scan process`);
  
  if (!file) {
    const errorMsg = 'No file provided to scanReceipt';
    console.error(`❌ ReceiptScanner: ${errorMsg}`);
    if (onError) onError(errorMsg);
    return { success: false, error: errorMsg };
  }

  console.log(`📋 ReceiptScanner: File details:`, {
    name: file.name,
    size: `${(file.size / 1024).toFixed(1)}KB`,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  });

  try {
    if (onProgress) onProgress(10, "Preparing receipt image...");

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = `Invalid file type: ${file.type}. Please upload an image.`;
      console.error(`❌ ReceiptScanner: ${errorMsg}`);
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`;
      console.error(`❌ ReceiptScanner: ${errorMsg}`);
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (onProgress) onProgress(20, "Converting image to base64...");

    // Convert file to base64 for edge function
    console.log(`🔄 ReceiptScanner: Converting ${file.name} to base64...`);
    const fileBuffer = await file.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
    console.log(`✅ ReceiptScanner: Base64 conversion complete (${base64File.length} chars)`);
    
    if (onProgress) onProgress(40, "Calling scan-receipt edge function...");
    
    console.log(`🚀 ReceiptScanner: Invoking scan-receipt edge function...`);
    
    const requestBody = {
      file: base64File,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      timestamp: Date.now()
    };
    
    console.log(`📤 ReceiptScanner: Request payload:`, {
      fileName: requestBody.fileName,
      fileType: requestBody.fileType,
      fileSize: requestBody.fileSize,
      timestamp: requestBody.timestamp,
      base64Length: requestBody.file.length
    });
    
    const { data, error } = await supabase.functions.invoke('scan-receipt', {
      body: requestBody
    });

    console.log(`📥 ReceiptScanner: Edge function response:`, { 
      hasData: !!data, 
      hasError: !!error,
      errorDetails: error ? JSON.stringify(error, null, 2) : null
    });
    
    if (data) {
      console.log(`📋 ReceiptScanner: Response data:`, JSON.stringify(data, null, 2));
    }

    if (onProgress) onProgress(60, "Processing response...");

    if (error) {
      console.error(`❌ ReceiptScanner: Edge function error:`, error);
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
      console.error(`❌ ReceiptScanner: ${errorMsg}`);
      if (onError) onError(errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        receiptUrl
      };
    }

    if (data.isTimeout) {
      console.log(`⏰ ReceiptScanner: Scan timed out on server`);
      if (onTimeout) onTimeout();
      return { 
        success: false, 
        isTimeout: true,
        warning: data.warning || "Processing timed out",
        receiptUrl
      };
    }

    if (data.error) {
      console.error(`❌ ReceiptScanner: Server returned error:`, data.error);
      if (onError) onError(data.error);
      return { 
        success: false, 
        error: data.error,
        receiptUrl
      };
    }

    if (onProgress) onProgress(80, "Extracting expense information...");

    // Ensure we have items (create fallback if needed)
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      console.warn(`⚠️ ReceiptScanner: No items found, creating fallback expense`);
      
      const fallbackItem = {
        description: data.merchant || "Store Purchase",
        amount: data.total || "0.00",
        date: data.date || new Date().toISOString().split('T')[0],
        category: "Other",
        paymentMethod: "Card"
      };

      console.log(`🔧 ReceiptScanner: Created fallback item:`, fallbackItem);

      return { 
        success: true,
        date: data.date,
        merchant: data.merchant || "Store",
        items: [fallbackItem],
        total: data.total,
        receiptUrl
      };
    }

    console.log(`✅ ReceiptScanner: Scan successful! Found ${data.items.length} items`);
    console.log(`📦 ReceiptScanner: Items:`, data.items);
    
    if (onProgress) onProgress(100, "Receipt processed successfully!");

    return { 
      success: true,
      date: data.date,
      merchant: data.merchant || "Store",
      items: data.items || [],
      total: data.total,
      receiptUrl
    };
  } catch (networkError) {
    console.error(`💥 ReceiptScanner: Network error during scan:`, networkError);
    const errorMsg = `Network error: ${networkError.message}`;
    if (onError) onError(errorMsg);
    return { 
      success: false, 
      error: errorMsg,
      receiptUrl
    };
  }
}
