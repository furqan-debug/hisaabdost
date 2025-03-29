
import { processLocalReceipt } from './receiptLocalProcessor';
import { toast } from 'sonner';

interface LocalScanOptions {
  file: File;
  onProgress?: (progress: number, message?: string) => void;
  onError?: (error: string) => void;
}

interface LocalScanResult {
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
  error?: string;
}

/**
 * Process a receipt using local processing as a fallback
 */
export async function processReceiptLocally({
  file,
  onProgress,
  onError
}: LocalScanOptions): Promise<LocalScanResult> {
  if (!file) {
    const errorMsg = "No file provided";
    console.error(errorMsg);
    if (onError) onError(errorMsg);
    return { success: false, error: errorMsg };
  }
  
  console.log(`Processing receipt locally: ${file.name} (${file.size} bytes, type: ${file.type})`);
  
  try {
    onProgress?.(60, "Using local recognition...");
    
    // Process the receipt using local methods
    const localResults = await processLocalReceipt(file);
    console.log("Local processing results:", localResults);
    
    if (!localResults) {
      throw new Error("Local processing failed to return results");
    }
    
    // Format the results
    const results = {
      success: true,
      items: localResults.items.map(item => ({
        description: item.name,
        amount: item.amount,
        date: item.date || new Date().toISOString().split('T')[0],
        category: item.category || 'Other',
        paymentMethod: item.paymentMethod || 'Card'
      })),
      date: localResults.date || new Date().toISOString().split('T')[0],
      total: localResults.total || "0.00"
    };
    
    onProgress?.(100, "Processed with local recognition");
    
    // Store scan result in session storage
    try {
      sessionStorage.setItem('lastScanResult', JSON.stringify(results));
    } catch (storageError) {
      console.warn("Could not store local scan result in session storage:", storageError);
    }
    
    return results;
    
  } catch (error) {
    console.error("Error in local processing:", error);
    if (onError) onError(error instanceof Error ? error.message : "Local processing failed");
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Local processing failed" 
    };
  }
}

/**
 * Create fallback items when no items can be extracted
 */
export function createFallbackItems(data?: { date?: string, total?: string }): Array<{
  description: string;
  amount: string;
  date: string;
  category: string;
  paymentMethod: string;
}> {
  return [
    {
      description: "Store Purchase",
      amount: data?.total || "0.00",
      date: data?.date || new Date().toISOString().split('T')[0],
      category: "Other",
      paymentMethod: "Card"
    }
  ];
}
