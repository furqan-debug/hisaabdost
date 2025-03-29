import { useState, useCallback } from 'react';
import { useScanProcess } from './useScanProcess';
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
  autoSave = false,
  setOpen,
  onSuccess,
  processAllItems = false
}: UseScanReceiptProps) {
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  
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
    if (!items || items.length === 0) return;
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }
      
      updateProgress(95, `Adding ${items.length} expenses to your list...`);
      
      // Format the items for the expenses table
      const expenses = items.map(item => ({
        user_id: user.id,
        description: item.description,
        amount: parseFloat(item.amount),
        date: item.date,
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
      } else {
        toast.success(`Successfully added ${expenses.length} expenses`);
        console.log("Expenses saved successfully:", data);
      }
    } catch (error) {
      console.error("Error in addExpensesToDatabase:", error);
      toast.error("Failed to save expenses");
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
          await handleSuccessfulScan(serverResults);
          return;
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
          await handleSuccessfulScan(localResults);
        } else {
          // Handle error with fallback
          console.error("Both server and local processing failed");
          errorScan("Failed to extract data from receipt");
          
          // Use fallback items
          const fallbackData = {
            success: true,
            items: createFallbackItems({ date: localResults.date }),
            date: localResults.date || new Date().toISOString().split('T')[0]
          };
          
          await handleSuccessfulScan(fallbackData);
        }
      } catch (localError) {
        console.error("Local processing also failed:", localError);
        errorScan("Both server and local processing failed. Please try again or enter details manually.");
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      errorScan("An unexpected error occurred while scanning");
    }
  }, [file, startScan, updateProgress, timeoutScan, errorScan, endScan]);
  
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
    if (scanResults.items && scanResults.items.length > 0) {
      updateProgress(90, `Found ${scanResults.items.length} items on receipt...`);
      
      // If we should process all items, add them to the database
      if (processAllItems) {
        await addExpensesToDatabase(scanResults.items);
      } 
      // Otherwise, just get the main item (for backward compatibility)
      else if (onCapture) {
        // Get the main item (first item or most expensive)
        const mainItem = selectMainItem(scanResults.items);
        
        // Create expense details
        const expenseDetails = {
          description: mainItem.description || "Store Purchase",
          amount: mainItem.amount || "0.00",
          date: mainItem.date || scanResults.date || new Date().toISOString().split('T')[0],
          category: mainItem.category || "Food",
          paymentMethod: mainItem.paymentMethod || "Card"
        };
        
        console.log("Captured expense details:", expenseDetails);
        
        onCapture(expenseDetails);
      }
      
      if (autoSave) {
        // Close dialog after success if autoSave is enabled
        setTimeout(() => {
          setOpen(false);
        }, 1000);
      }
    }
    
    // Finish the scan
    updateProgress(100, "Receipt processed successfully!");
    setTimeout(() => {
      endScan();
      if (onSuccess) {
        onSuccess();
      }
    }, 300);
  }, [updateProgress, endScan, onCapture, setOpen, autoSave, onSuccess, processAllItems, addExpensesToDatabase]);
  
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
        await handleScanReceipt();
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
    autoProcessReceipt,
    resetScanState: resetState
  };
}

// Helper function to select the most relevant item from scan results
function selectMainItem(items: Array<{
  description: string;
  amount: string;
  date: string;
  category: string;
  paymentMethod: string;
}>): {
  description: string;
  amount: string;
  date: string;
  category: string;
  paymentMethod: string;
} {
  if (!items || items.length === 0) return {
    description: "Store Purchase",
    amount: "0.00",
    date: new Date().toISOString().split('T')[0],
    category: "Food", 
    paymentMethod: "Card"
  };
  
  // If there's only one item, use it
  if (items.length === 1) return items[0];
  
  // Try to find the item with the highest amount
  return items.reduce((highest, current) => {
    const highestAmount = parseFloat(highest.amount || '0');
    const currentAmount = parseFloat(current.amount || '0');
    return currentAmount > highestAmount ? current : highest;
  }, items[0]);
}
