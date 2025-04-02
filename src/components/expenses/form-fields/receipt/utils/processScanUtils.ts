
import { formatDate } from './dateUtils';
import { saveExpenseFromScan } from '../services/expenseDbService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Process the results of the receipt scan
 */
export async function processScanResults(
  scanResult: any,
  autoSave: boolean,
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void,
  setOpen?: (open: boolean) => void
): Promise<boolean> {
  console.log("Processing scan result:", scanResult);
  
  if (!scanResult || !scanResult.items || scanResult.items.length === 0) {
    console.log("No items found in scan result");
    toast.error("No items found in receipt");
    return false;
  }
  
  // Format all items for saving, ensuring all required fields are present
  const formattedItems = scanResult.items.map((item: any) => ({
    description: item.name || (scanResult.merchant ? `Purchase from ${scanResult.merchant}` : "Store Purchase"),
    amount: item.amount?.toString().replace('$', '') || scanResult.total?.toString() || "0.00",
    date: formatDate(scanResult.date || item.date || new Date().toISOString().split('T')[0]),
    category: item.category || "Food", // Default to Food if no category
    paymentMethod: "Card", // Default assumption for receipts
    receiptUrl: scanResult.receiptUrl || null
  }));
  
  // Log the formatted items
  console.log("Formatted items for processing:", formattedItems);
  
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated, cannot save expenses");
      toast.error("Please log in to save expenses");
      
      // If onCapture is provided, still update the form with the first item
      if (onCapture && formattedItems.length > 0) {
        onCapture(formattedItems[0]);
      }
      
      return false;
    }
    
    // Add user_id to each item
    const itemsWithUserId = formattedItems.map(item => ({
      ...item,
      user_id: user.id
    }));
    
    // Always save all expenses automatically regardless of autoSave flag
    if (formattedItems.length > 0) {
      try {
        // Insert expenses directly into the database
        const { data, error } = await supabase
          .from('expenses')
          .insert(itemsWithUserId.map(item => ({
            user_id: item.user_id,
            description: item.description,
            amount: parseFloat(item.amount),
            date: item.date,
            category: item.category || 'Food',
            receipt_url: item.receiptUrl,
            payment: item.paymentMethod,
            is_recurring: false
          })));
        
        if (error) {
          console.error("Error saving expenses:", error);
          toast.error("Failed to save expenses from receipt");
          
          // Even if saving to database failed, still update the form if onCapture is provided
          if (onCapture && formattedItems.length > 0) {
            onCapture(formattedItems[0]);
          }
          return false;
        }
        
        console.log("Successfully saved expenses to database");
        toast.success(`Successfully saved ${formattedItems.length} expense(s) from receipt`);
        
        // Dispatch custom event to trigger expense list refresh
        const event = new CustomEvent('expenses-updated', { 
          detail: { timestamp: Date.now() }
        });
        window.dispatchEvent(event);
        
        // If onCapture is provided, also update the form with the first item
        if (onCapture && formattedItems.length > 0) {
          onCapture(formattedItems[0]);
        }
        
        // Close the dialog after a short delay
        if (setOpen) {
          setTimeout(() => setOpen(false), 1000);
        }
        return true;
        
      } catch (error) {
        console.error("Error saving expense from scan:", error);
        toast.error("Error processing receipt");
        
        // Even if an error occurred, still update the form if onCapture is provided
        if (onCapture && formattedItems.length > 0) {
          onCapture(formattedItems[0]);
        }
        return false;
      }
    } else {
      toast.error("No valid items found in receipt");
      return false;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
    toast.error("Authentication error");
    return false;
  }
}
