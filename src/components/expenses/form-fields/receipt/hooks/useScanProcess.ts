
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useScanProcess(props: {
  updateProgress: (progress: number, message?: string) => void;
  endScan: () => void;
  timeoutScan: () => void;
  errorScan: (message: string) => void;
}) {
  const { updateProgress, endScan, timeoutScan, errorScan } = props;
  
  // Reference to track ongoing scans
  const ongoingScansRef = useRef<Map<string, { timestamp: number, promise: Promise<any> }>>(new Map());
  
  // Clean up stale scan entries periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const staleThreshold = 5 * 60 * 1000; // 5 minutes
      const ongoingScans = ongoingScansRef.current;
      
      for (const [scanId, data] of ongoingScans.entries()) {
        if (now - data.timestamp > staleThreshold) {
          console.log(`Removing stale scan entry: ${scanId}`);
          ongoingScans.delete(scanId);
        }
      }
    }, 60000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  // Create a more robust file fingerprint
  const createFileFingerprint = useCallback((file: File): string => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);
  
  const processScan = useCallback(async (formData: FormData) => {
    try {
      // Get the file from the form data
      const file = formData.get('file') as File;
      if (!file) {
        console.error("No file in formData");
        return null;
      }
      
      // Generate a unique ID for this scan request using the file fingerprint
      const fileFingerprint = createFileFingerprint(file);
      const uniqueTimestamp = Date.now().toString();
      const scanId = `scan-${fileFingerprint}`;
      
      // Check if this scan is already in progress
      const ongoingScans = ongoingScansRef.current;
      if (ongoingScans.has(scanId)) {
        console.log(`Scan with ID ${scanId} is already in progress, reusing existing promise`);
        return ongoingScans.get(scanId)?.promise;
      }
      
      console.log(`Starting new scan for file: ${file.name} (${file.size} bytes) with ID: ${scanId}`);
      
      // Create a new scan process
      const scanPromise = (async () => {
        try {
          updateProgress(10, "Preparing receipt for OCR...");
          
          const timeoutId = setTimeout(() => {
            timeoutScan();
          }, 45000);
          
          try {
            updateProgress(30, "Processing with OCR...");
            
            // Use the unique timestamp to prevent duplicate scans
            formData.set('timestamp', uniqueTimestamp);
            
            // Add request metadata for tracking
            formData.set('retry', '0'); // Initial attempt
            formData.set('enhanced', 'true');
            
            // IMPORTANT: DO NOT manually set the Content-Type header for multipart/form-data
            const { data, error } = await supabase.functions.invoke('scan-receipt', {
              method: 'POST',
              body: formData,
              headers: {
                'X-Processing-Level': 'high',
                'X-Request-ID': scanId // Add a request ID for tracking
              }
            });
            
            clearTimeout(timeoutId);
            
            if (data?.isTimeout === true) {
              console.error("Scan timed out on server side");
              timeoutScan();
              
              if (data?.items?.length > 0) {
                console.log("Using fallback data despite timeout:", data);
                return {
                  success: true,
                  ...data
                };
              }
              
              return null;
            }
            
            if (error) {
              console.error("Scan error:", error);
              errorScan("Failed to process receipt. Please try again or use manual entry.");
              return null;
            }
            
            if (!data) {
              errorScan("No data was returned from the receipt scanner.");
              return null;
            }
            
            console.log("Raw scan data received:", data);
            updateProgress(70, "Analyzing receipt data...");
            
            if (data.error || data.warning) {
              console.warn("Scan completed with warning:", data.error || data.warning);
              toast.warning(data.warning || "Receipt processed with limited accuracy");
            }
            
            const processedData = {
              success: true,
              items: Array.isArray(data.items) ? data.items : [],
              date: data.date || new Date().toISOString().split('T')[0],
              total: data.total || "0.00",
              receiptUrl: data.receiptUrl
            };
            
            if (!processedData.items || processedData.items.length === 0) {
              processedData.items = [{ 
                name: "Store Purchase", 
                amount: processedData.total || "0.00",
                date: processedData.date
              }];
            }
            
            // Store scan result in session storage with a timestamp to enable expiration
            const storageData = {
              ...processedData,
              timestamp: Date.now(),
              fileFingerprint // Store the file fingerprint for future reference
            };
            sessionStorage.setItem('lastScanResult', JSON.stringify(storageData));
            console.log("Stored scan result:", processedData);
            
            updateProgress(100, "Receipt processed successfully!");
            
            setTimeout(() => {
              endScan();
            }, 300);
            
            return processedData;
            
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        } catch (error) {
          throw error;
        } finally {
          // Remove from ongoing scans map after completion
          setTimeout(() => {
            if (ongoingScansRef.current.has(scanId)) {
              console.log(`Removing completed scan: ${scanId}`);
              ongoingScansRef.current.delete(scanId);
            }
          }, 5000); // Short delay to allow other code to access the result
        }
      })();
      
      // Track this scan using the ref
      ongoingScansRef.current.set(scanId, { 
        timestamp: Date.now(),
        promise: scanPromise
      });
      
      return scanPromise;
      
    } catch (error) {
      console.error("Error scanning receipt:", error);
      errorScan("Failed to scan receipt. Please try again or enter details manually.");
      return null;
    }
  }, [updateProgress, endScan, timeoutScan, errorScan, createFileFingerprint]);

  // Helper function to add expenses to the database
  const addExpensesToDatabase = useCallback(async (
    items: Array<{
      description: string;
      amount: string;
      date: string;
      category: string;
      paymentMethod: string;
    }>,
    updateProgressFn: (progress: number, message?: string) => void
  ) => {
    if (!items || items.length === 0) {
      console.error("No items to add to database");
      return false;
    }
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return false;
      }
      
      updateProgressFn(95, `Adding ${items.length} expenses to your list...`);
      
      // Format the items for the expenses table
      const expenses = items.map(item => ({
        user_id: user.id,
        description: item.description || "Store Purchase",
        amount: parseFloat(String(item.amount).replace('$', '')) || 0,
        date: item.date || new Date().toISOString().split('T')[0],
        category: item.category || 'Food',
        is_recurring: false,
        receipt_url: null,
        payment: item.paymentMethod || 'Card', // Match the DB column name
        created_at: new Date().toISOString()
      }));
      
      console.log("Adding expenses to database:", expenses);
      
      // Insert all expenses
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenses)
        .select();
      
      if (error) {
        console.error("Error saving expenses:", error);
        toast.error(`Failed to save expenses: ${error.message}`);
        return false;
      } else {
        const itemText = expenses.length === 1 ? "expense" : "expenses";
        toast.success(`Added ${expenses.length} ${itemText} from your receipt`, {
          description: "Check your expenses list to see them",
          duration: 5000
        });
        console.log("Expenses saved successfully:", data);
        
        // Trigger a refresh of the expenses list
        const event = new CustomEvent('expenses-updated');
        window.dispatchEvent(event);
        
        return true;
      }
    } catch (error) {
      console.error("Error in addExpensesToDatabase:", error);
      toast.error("Failed to save expenses");
      return false;
    }
  }, []);

  return { 
    processScan, 
    createFileFingerprint,
    addExpensesToDatabase 
  };
}
