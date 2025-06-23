
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

    // Validate file size (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
      const errorMsg = `File size exceeds 5MB limit. Your file is ${fileSizeMB}MB. Please choose a smaller image.`;
      console.error(`❌ ReceiptScanner: ${errorMsg}`);
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (onProgress) onProgress(20, "Converting image...");

    // Convert file to base64 using a more memory-efficient approach
    console.log(`🔄 ReceiptScanner: Converting ${file.name} to base64...`);
    
    let base64File: string;
    try {
      // Use FileReader for better memory handling with large files
      base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to read file as base64'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(file);
      });
    } catch (conversionError) {
      console.error('❌ ReceiptScanner: Base64 conversion error:', conversionError);
      const errorMsg = 'Failed to process image. Please try a smaller image or different format.';
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log(`✅ ReceiptScanner: Base64 conversion complete (${base64File.length} chars)`);
    
    if (onProgress) onProgress(40, "Scanning receipt with OCR...");
    
    console.log(`🚀 ReceiptScanner: Calling scan-receipt edge function...`);
    const startTime = Date.now();
    
    // Call the edge function with proper error handling and timeout
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort();
    }, 60000); // 60 second timeout
    
    let response;
    try {
      response = await supabase.functions.invoke('scan-receipt', {
        body: {
          file: base64File,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (invokeError) {
      clearTimeout(timeoutId);
      console.error('❌ ReceiptScanner: Edge function invoke error:', invokeError);
      
      if (invokeError.name === 'AbortError') {
        console.log('⏰ ReceiptScanner: Request timed out');
        if (onTimeout) onTimeout();
        return { success: false, error: 'Processing timed out. Please try again.', isTimeout: true };
      }
      
      const errorMsg = `Failed to process receipt: ${invokeError.message || 'Network error'}`;
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.log(`⏱️ ReceiptScanner: Edge function completed in ${duration}ms`);

    const { data, error } = response;

    if (error) {
      console.error('❌ ReceiptScanner: Edge function error:', error);
      const errorMsg = `Failed to process receipt: ${error.message || 'Unknown error'}`;
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!data) {
      console.error('❌ ReceiptScanner: No data returned from edge function');
      const errorMsg = 'No response received from receipt processing service';
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log(`📥 ReceiptScanner: Edge function response:`, {
      success: data.success,
      hasItems: !!data.items,
      itemCount: data.items?.length || 0,
      merchant: data.merchant,
      total: data.total,
      hasWarning: !!data.warning
    });

    if (onProgress) onProgress(80, "Processing scan results...");

    // Validate that we have actual receipt data
    if (!data.success) {
      console.error('❌ ReceiptScanner: Scan was not successful:', data.error);
      const errorMsg = data.error || 'Receipt scanning failed';
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Check for timeout in response
    if (data.isTimeout) {
      console.log('⏰ ReceiptScanner: Processing timed out on server');
      if (onTimeout) onTimeout();
      return { success: false, error: 'Processing timed out', isTimeout: true };
    }

    // Ensure we have items
    if (!data.items || data.items.length === 0) {
      console.error('❌ ReceiptScanner: No items found in receipt');
      const errorMsg = 'No items could be extracted from the receipt';
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Validate items have required fields
    const validItems = data.items.filter(item => 
      item.description && 
      item.amount && 
      !isNaN(parseFloat(item.amount)) &&
      parseFloat(item.amount) > 0
    );

    if (validItems.length === 0) {
      console.error('❌ ReceiptScanner: No valid items found');
      const errorMsg = 'No valid expense items could be extracted from the receipt';
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log(`✅ ReceiptScanner: Found ${validItems.length} valid items out of ${data.items.length} total`);

    if (onProgress) onProgress(90, `Found ${validItems.length} items to add...`);

    // Return successful scan result with validated items
    return {
      success: true,
      items: validItems,
      merchant: data.merchant || 'Unknown Store',
      date: data.date || new Date().toISOString().split('T')[0],
      total: data.total || '0.00',
      warning: data.warning
    };

  } catch (error) {
    console.error('💥 ReceiptScanner: Unexpected error:', error);
    const errorMsg = `Receipt processing failed: ${error.message || 'Unknown error'}`;
    if (onError) onError(errorMsg);
    return { success: false, error: errorMsg };
  }
}
