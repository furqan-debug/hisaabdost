
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
    
    console.log(`🚀 ReceiptScanner: Calling scan-receipt edge function...`);
    const startTime = Date.now();
    
    // Call the edge function with proper error handling
    const { data, error } = await supabase.functions.invoke('scan-receipt', {
      body: {
        file: base64File,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ ReceiptScanner: Edge function completed in ${duration}ms`);

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

    // Validate that we have actual receipt data, not fallback data
    if (!data.success) {
      console.error('❌ ReceiptScanner: Scan was not successful:', data.error);
      const errorMsg = data.error || 'Receipt scanning failed';
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Check if this is fallback/mock data
    if (data.warning && data.warning.includes('limited accuracy')) {
      console.warn('⚠️ ReceiptScanner: Received fallback data due to OCR limitations');
      // Still process it, but warn the user
      if (onProgress) onProgress(85, "Using fallback processing due to OCR limitations...");
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
