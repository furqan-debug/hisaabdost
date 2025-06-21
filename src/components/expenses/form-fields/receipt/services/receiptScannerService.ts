
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

    // Validate file size (2MB limit)
    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
      const errorMsg = `File size exceeds 2MB limit. Your file is ${fileSizeMB}MB. Please choose a smaller image.`;
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
    
    if (onProgress) onProgress(40, "Scanning receipt with OCR...");
    
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
      let errorMsg = `Server error: ${error.message || 'Unknown error'}`;
      
      // Provide better error messages for common issues
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorMsg = "Receipt scanning is temporarily unavailable due to high demand. Please try again later or enter your expense manually.";
      } else if (error.message?.includes('authentication')) {
        errorMsg = "Receipt scanning service is temporarily unavailable. Please try again later or enter your expense manually.";
      }
      
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

    // Handle warnings (when using fallback processing)
    if (data.warning) {
      console.warn(`⚠️ ReceiptScanner: Processing completed with warning: ${data.warning}`);
      if (onProgress) onProgress(70, data.warning);
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

    if (data.error || !data.success) {
      console.error(`❌ ReceiptScanner: Server returned error:`, data.error);
      let errorMsg = data.error || "Receipt processing failed";
      
      // Provide user-friendly error messages
      if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
        errorMsg = "Receipt scanning is temporarily unavailable due to high demand. Please try again later or enter your expense manually.";
      }
      
      if (onError) onError(errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        receiptUrl
      };
    }

    if (onProgress) onProgress(80, "Extracting expense information...");

    // Process the successful response
    let validatedItems: any[] = [];
    
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      validatedItems = data.items
        .filter(item => item && item.description && item.amount)
        .map(item => ({
          description: item.description,
          amount: item.amount,
          date: item.date || data.date || new Date().toISOString().split('T')[0],
          category: item.category || "Other",
          paymentMethod: item.paymentMethod || "Card"
        }))
        .filter(item => parseFloat(item.amount) > 0);
      
      console.log(`✅ ReceiptScanner: Validated ${validatedItems.length} items from scan`);
    }

    // If no valid items found, return error with helpful message
    if (validatedItems.length === 0) {
      console.warn(`⚠️ ReceiptScanner: No valid items could be extracted from receipt`);
      const errorMsg = data.warning 
        ? "Receipt processed with limited accuracy. Please review and adjust the details as needed."
        : "Could not extract any valid expense items from the receipt. Please try again or enter manually.";
      
      if (onError) onError(errorMsg);
      return { 
        success: false,
        error: errorMsg,
        receiptUrl,
        warning: data.warning
      };
    }

    console.log(`✅ ReceiptScanner: Scan successful! Found ${validatedItems.length} valid items`);
    console.log(`📦 ReceiptScanner: Validated items:`, validatedItems);
    
    if (onProgress) {
      const progressMsg = data.warning 
        ? "Receipt processed with limited accuracy!"
        : "Receipt processed successfully!";
      onProgress(100, progressMsg);
    }

    return { 
      success: true,
      date: data.date || new Date().toISOString().split('T')[0],
      merchant: data.merchant || "Store",
      items: validatedItems,
      total: data.total,
      receiptUrl,
      warning: data.warning
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
