
import { ScanResult, processScanResults } from '../utils/processScanUtils';

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
    if (onError) onError('No file provided');
    return { success: false, error: 'No file provided' };
  }

  try {
    if (onProgress) onProgress(10, "Preparing receipt image...");

    // Create a form data object to send to the edge function
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', Date.now().toString());
    formData.append('retry', '0');
    formData.append('enhanced', 'true'); // Request enhanced processing

    // Get Supabase URL from the window location
    const supabaseUrl = getScanEndpoint();

    if (onProgress) onProgress(20, "Analyzing receipt...");

    // Start a timer for the scan
    const scanStartTime = Date.now();
    const timeoutDuration = 25000; // 25 seconds timeout
    const timeoutPromise = new Promise<ScanResult>((resolve) => {
      setTimeout(() => {
        if (Date.now() - scanStartTime >= timeoutDuration) {
          if (onTimeout) onTimeout();
          resolve({ success: false, isTimeout: true });
        }
      }, timeoutDuration);
    });

    // Fetch promise
    const fetchPromise = fetch(supabaseUrl, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      // Update progress based on response status
      if (onProgress) onProgress(60, "Processing receipt text...");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Scan API error:", response.status, errorText);
        if (onError) onError(`Server error: ${response.status}`);
        return { 
          success: false, 
          error: `Server error: ${response.status}`,
          receiptUrl
        };
      }

      try {
        const data = await response.json();
        console.log("Receipt scan API response:", data);

        if (data.isTimeout) {
          if (onTimeout) onTimeout();
          return { 
            success: false, 
            isTimeout: true,
            warning: data.warning || "Processing timed out",
            receiptUrl
          };
        }

        if (data.error) {
          if (onError) onError(data.error);
          return { 
            success: false, 
            error: data.error,
            receiptUrl
          };
        }

        if (onProgress) onProgress(80, "Extracting expense information...");

        // Return success with the extracted data
        return { 
          success: true,
          date: data.date,
          merchant: data.merchant || "Store",
          items: data.items || [],
          total: data.total,
          receiptUrl
        };
      } catch (error) {
        console.error("Failed to parse scan response:", error);
        if (onError) onError("Failed to parse server response");
        return { 
          success: false, 
          error: "Failed to parse server response",
          receiptUrl
        };
      }
    }).catch(error => {
      console.error("Network error during scan:", error);
      if (onError) onError("Network error");
      return { 
        success: false, 
        error: "Network error",
        receiptUrl
      };
    });

    // Race between the fetch and the timeout
    const result = await Promise.race([fetchPromise, timeoutPromise]);

    if (result.isTimeout) {
      console.log("Scan timed out");
      if (onTimeout) onTimeout();
    } else if (!result.success) {
      console.log("Scan failed:", result.error);
    } else {
      console.log("Scan completed successfully");
      if (onProgress) onProgress(100, "Receipt processed!");
    }

    return {
      ...result,
      receiptUrl // Ensure the receipt URL is preserved in the result
    };
  } catch (error) {
    console.error("Error in scanReceipt:", error);
    if (onError) onError("Unexpected error");
    return { 
      success: false, 
      error: "Unexpected error", 
      receiptUrl
    };
  }
}

/**
 * Get the scan endpoint URL dynamically
 */
function getScanEndpoint(): string {
  // Get the hostname
  const host = window.location.hostname;
  
  // If we're on localhost, use the dev endpoint
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'https://bklfolfivjonzpprytkz.supabase.co/functions/v1/scan-receipt';
  }
  
  // In production, use the project's domain
  return 'https://bklfolfivjonzpprytkz.supabase.co/functions/v1/scan-receipt';
}
