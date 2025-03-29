
import { useState, useCallback } from 'react';
import { useScanState } from './useScanState';
import { processReceiptWithServer } from '../utils/serverProcessor';
import { processReceiptLocally, createFallbackItems } from '../utils/localProcessor';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface UseScanReceiptProps {
  file: File | null;
  onCleanup: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  autoSave?: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
  processAllItems?: boolean;
}

export function useScanReceipt({
  file,
  onCleanup,
  onCapture,
  autoSave = true,
  setOpen,
  onSuccess,
  processAllItems = true
}: UseScanReceiptProps) {
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // Use the scan state hook for managing scan progress, status, etc.
  const {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    startScan,
    updateProgress,
    endScan,
    timeoutScan,
    errorScan,
    resetState
  } = useScanState();
  
  // Helper function to add expenses to the database
  const addExpensesToDatabase = useCallback(async (items: Array<{
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }>) => {
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
      
      updateProgress(95, `Adding ${items.length} expenses to your list...`);
      
      // Format the items for the expenses table
      const expenses = items.map(item => ({
        user_id: user.id,
        description: item.description || "Store Purchase",
        amount: parseFloat(item.amount) || 0,
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
  }, [updateProgress]);
  
  // Handle manual scan request
  const handleScanReceipt = useCallback(async () => {
    if (!file) {
      toast.error("No file selected for scanning");
      return;
    }
    
    console.log(`Starting manual scan of receipt: ${file.name}`);
    
    try {
      startScan();
      updateProgress(5, "Preparing receipt...");
      
      // First try server-side processing
      try {
        updateProgress(20, "Uploading receipt for analysis...");
        
        const serverResults = await processReceiptWithServer({
          file,
          onProgress: updateProgress,
          onTimeout: timeoutScan,
          onError: message => {
            console.warn("Server processing failed:", message);
            updateProgress(50, "Server processing failed, trying local...");
          }
        });
        
        if (serverResults.success && serverResults.items && serverResults.items.length > 0) {
          console.log("Server scan successful:", serverResults);
          
          // Process successful scan results
          const success = await handleSuccessfulScan(serverResults);
          return success;
        }
        
        // Handle timeout or error from server
        if (serverResults.isTimeout) {
          console.log("Server scan timed out, trying local processing");
          // Continue to local processing
        } else if (serverResults.error) {
          console.warn("Server returned error:", serverResults.error);
          // Continue to local processing
        }
      } catch (serverError) {
        console.error("Server scan process failed:", serverError);
        // Continue to local processing
      }
      
      // Try local processing as fallback
      updateProgress(60, "Using local recognition instead...");
      
      try {
        const localResults = await processReceiptLocally({
          file,
          onProgress: updateProgress,
          onError: errorScan
        });
        
        if (localResults.success && localResults.items && localResults.items.length > 0) {
          console.log("Local processing successful:", localResults);
          
          // Process successful scan results
          const success = await handleSuccessfulScan(localResults);
          return success;
        } else {
          // Handle error with fallback
          console.error("Both server and local processing failed");
          
          // Use fallback items
          const fallbackData = {
            success: true,
            items: createFallbackItems({ date: localResults.date }),
            date: localResults.date || new Date().toISOString().split('T')[0]
          };
          
          const success = await handleSuccessfulScan(fallbackData);
          if (!success) {
            errorScan("Failed to add items to your expenses");
          }
          return success;
        }
      } catch (localError) {
        console.error("Local processing also failed:", localError);
        errorScan("Both server and local processing failed. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      errorScan("An unexpected error occurred while scanning");
      return false;
    }
  }, [file, startScan, updateProgress, timeoutScan, errorScan]);
  
  // Helper to process successful scan results
  const handleSuccessfulScan = useCallback(async (scanResults: {
    success: boolean;
    items?: Array<{
      description: string;
      amount: string;
      date: string;
      category: string;
      paymentMethod: string;
    }>;
    date?: string;
  }) => {
    if (!scanResults.items || scanResults.items.length === 0) {
      console.warn("No items found in scan results");
      return false;
    }
    
    updateProgress(90, `Found ${scanResults.items.length} items on receipt...`);
    
    // Always process all items and add them to the database
    const success = await addExpensesToDatabase(scanResults.items);
    
    // If we successfully added the expenses, mark as complete and finish
    if (success) {
      // Also call the onCapture callback for backward compatibility if needed
      if (onCapture && scanResults.items.length > 0) {
        // Use the first item as an example
        onCapture(scanResults.items[0]);
      }
      
      // Finish the scan with success message and a short delay for UI
      updateProgress(100, "Receipt processed successfully!");
      setProcessingComplete(true);
      
      // Close the scan dialog automatically after a short delay
      setTimeout(() => {
        endScan();
        if (onSuccess) {
          onSuccess();
        }
        
        // Automatically close the dialog after successful processing
        setOpen(false);
        onCleanup();
      }, 1500);
      
      return true;
    } else {
      errorScan("Failed to add expenses to your list");
      return false;
    }
  }, [updateProgress, endScan, onCapture, addExpensesToDatabase, onSuccess, errorScan, setOpen, onCleanup]);
  
  // Auto-process receipt without requiring user to click scan button
  const autoProcessReceipt = useCallback(() => {
    if (!file) {
      console.error("Cannot auto-process: No file provided");
      return;
    }
    
    setIsAutoProcessing(true);
    
    // Slight delay to allow UI to update
    setTimeout(async () => {
      try {
        const success = await handleScanReceipt();
        // Process all receipt items and add them to expenses, 
        // no need for manual processing option
        if (!success) {
          console.error("Auto-processing failed");
        }
      } finally {
        setIsAutoProcessing(false);
      }
    }, 100);
  }, [file, handleScanReceipt]);

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    isAutoProcessing,
    processingComplete,
    autoProcessReceipt,
    resetScanState: resetState
  };
}
