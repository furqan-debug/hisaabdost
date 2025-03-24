import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UseScanProcessProps {
  updateProgress: (progress: number, message?: string) => void;
  endScan: () => void;
  timeoutScan: () => void;
}

export function useScanProcess({
  updateProgress,
  endScan,
  timeoutScan
}: UseScanProcessProps) {
  // Process the scan with edge function
  const processScan = useCallback(async (formData: FormData) => {
    try {
      updateProgress(30, "Processing with OCR...");
      
      // Set a timeout to detect when scanning takes too long
      const timeoutId = setTimeout(() => {
        timeoutScan();
      }, 20000); // 20 seconds timeout
      
      // Call the Supabase function
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        method: 'POST',
        body: formData,
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.warn("Scan completed with error:", error);
        toast.error("Couldn't read receipt clearly. Please enter details manually.");
        endScan();
        return null;
      }
      
      // Store the result in session storage for use
      if (data) {
        try {
          sessionStorage.setItem('lastScanResult', JSON.stringify(data));
          
          // Automatically add the expense to the database if results are valid
          if (data.items && data.items.length > 0) {
            await saveExpenseFromScan(data);
          }
        } catch (err) {
          console.error("Error storing scan result:", err);
        }
      }
      
      updateProgress(100, "Scan complete!");
      
      // Mark scan as complete
      setTimeout(() => {
        endScan();
      }, 300);
      
      return data;
    } catch (error) {
      console.error("Error scanning receipt:", error);
      endScan();
      toast.error("Failed to scan receipt. Please try again or enter details manually.");
      return null;
    }
  }, [updateProgress, endScan, timeoutScan]);

  return processScan;
}

// Helper function to save expense from scan data
async function saveExpenseFromScan(scanData: any) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("User not authenticated, skipping auto-save");
      return;
    }
    
    // Find the most relevant item (usually the most expensive one)
    const mainItem = findMainItem(scanData.items);
    if (!mainItem) {
      return;
    }
    
    // Format expense data
    const newExpense = {
      id: uuidv4(),
      user_id: user.id,
      description: formatDescription(mainItem.name, scanData.storeName),
      amount: parseFloat(mainItem.amount) || 0,
      date: formatDate(mainItem.date),
      category: mainItem.category || 'Other',
      payment: 'Card', // Default to card
      receipt_url: scanData.receiptUrl || null,
      is_recurring: false
    };
    
    // Insert expense into database
    const { error } = await supabase
      .from('expenses')
      .insert(newExpense);
    
    if (error) {
      console.error("Error saving expense:", error);
      return;
    }
    
    toast.success("Receipt scanned and expense added automatically");
    
    // Refresh expenses list by triggering a query invalidation
    // This is handled by the expense list component's useQuery
    
  } catch (error) {
    console.error("Error auto-saving expense:", error);
  }
}

// Find the most relevant item from scan results
function findMainItem(items: any[]) {
  if (!items || items.length === 0) return null;
  
  // If there's only one item, use it
  if (items.length === 1) return items[0];
  
  // Otherwise, use the most expensive item
  return [...items].sort((a, b) => {
    const amountA = parseFloat(a.amount || '0');
    const amountB = parseFloat(b.amount || '0');
    return amountB - amountA;
  })[0];
}

// Format the description from item name and store
function formatDescription(itemName: string, storeName: string) {
  if (itemName && itemName.length > 3) {
    return itemName.charAt(0).toUpperCase() + itemName.slice(1);
  }
  
  if (storeName) {
    return `Purchase from ${storeName}`;
  }
  
  return "Store Purchase";
}

// Format date for database
function formatDate(dateString: string) {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  try {
    // If already in ISO format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}
