
import { formatDate } from './dateUtils';
import { saveExpenseFromScan } from '../services/expenseDbService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define the ScanResult interface with consistent optional properties
export interface ScanResult {
  success: boolean;
  date?: string;
  items?: any[];
  total?: string;
  merchant?: string;
  receiptUrl?: string;
  error?: string;
  isTimeout?: boolean;
  warning?: string;
}

/**
 * Process the results of the receipt scan
 */
export async function processScanResults(
  scanResult: ScanResult,
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
  
  // Get current date in YYYY-MM-DD format for default date value
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayFormatted = `${yyyy}-${mm}-${dd}`;
  
  // Default to current date if none found in receipt
  const receiptDate = scanResult.date ? formatDate(scanResult.date) : todayFormatted;
  console.log("Using receipt date:", receiptDate);
  
  // Validate the receipt date is reasonable (not too old or in the far future)
  const receiptYear = new Date(receiptDate).getFullYear();
  const validatedReceiptDate = (receiptYear < 2020 || receiptYear > 2030) ? todayFormatted : receiptDate;
  if (validatedReceiptDate !== receiptDate) {
    console.log(`Receipt date year ${receiptYear} out of reasonable range, using today's date instead`);
  }
  
  // Format all items for saving, ensuring all required fields are present
  const formattedItems = scanResult.items.map((item: any) => ({
    description: item.description || (scanResult.merchant ? `Purchase from ${scanResult.merchant}` : "Store Purchase"),
    amount: parseFloat(item.amount?.toString().replace('$', '') || scanResult.total?.toString() || "0.00"),
    date: formatDate(item.date || validatedReceiptDate),
    category: item.category || "Food", // Default to Food if no category
    paymentMethod: item.paymentMethod || "Card", // Default assumption for receipts
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
        const firstItem = formattedItems[0];
        onCapture({
          description: firstItem.description,
          amount: firstItem.amount.toString(),
          date: firstItem.date,
          category: firstItem.category,
          paymentMethod: firstItem.paymentMethod
        });
      }
      
      return false;
    }
    
    // Insert expenses directly into the database
    if (formattedItems.length > 0) {
      try {
        console.log("Inserting expenses into database for user:", user.id);
        
        // Prepare expense data for database insertion
        const expenseData = formattedItems.map(item => ({
          user_id: user.id,
          description: item.description,
          amount: item.amount,
          date: item.date,
          category: item.category,
          payment: item.paymentMethod,
          receipt_url: item.receiptUrl,
          is_recurring: false,
          notes: scanResult.merchant ? `From receipt: ${scanResult.merchant}` : null
        }));
        
        console.log("Expense data to insert:", expenseData);
        
        // Insert expenses into the database
        const { data, error } = await supabase
          .from('expenses')
          .insert(expenseData)
          .select('id, description, amount');
        
        if (error) {
          console.error("Database error saving expenses:", error);
          toast.error(`Failed to save expenses: ${error.message}`);
          
          // Even if saving to database failed, still update the form if onCapture is provided
          if (onCapture && formattedItems.length > 0) {
            const firstItem = formattedItems[0];
            onCapture({
              description: firstItem.description,
              amount: firstItem.amount.toString(),
              date: firstItem.date,
              category: firstItem.category,
              paymentMethod: firstItem.paymentMethod
            });
          }
          return false;
        }
        
        console.log("Successfully saved expenses to database:", data);
        
        const itemText = formattedItems.length === 1 ? "expense" : "expenses";
        toast.success(`Successfully saved ${formattedItems.length} ${itemText} from receipt!`);
        
        // Dispatch events to refresh expense lists
        console.log("Dispatching expense update events...");
        
        // Immediate refresh event
        window.dispatchEvent(new CustomEvent('expenses-updated', { 
          detail: { 
            timestamp: Date.now(), 
            count: formattedItems.length,
            action: 'receipt-scan'
          }
        }));
        
        // Additional events for different components
        window.dispatchEvent(new CustomEvent('receipt-scanned', { 
          detail: { 
            timestamp: Date.now(), 
            count: formattedItems.length 
          }
        }));
        
        window.dispatchEvent(new CustomEvent('expense-added', { 
          detail: { 
            timestamp: Date.now(), 
            count: formattedItems.length 
          }
        }));
        
        // Delayed refresh to ensure all components catch the update
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('expense-refresh', { 
            detail: { timestamp: Date.now() }
          }));
          console.log("Dispatched delayed refresh event");
        }, 500);
        
        // If onCapture is provided, also update the form with the first item
        if (onCapture && formattedItems.length > 0) {
          const firstItem = formattedItems[0];
          onCapture({
            description: firstItem.description,
            amount: firstItem.amount.toString(),
            date: firstItem.date,
            category: firstItem.category,
            paymentMethod: firstItem.paymentMethod
          });
        }
        
        // Close the dialog after a short delay
        if (setOpen) {
          setTimeout(() => {
            console.log("Closing scan dialog");
            setOpen(false);
          }, 2000);
        }
        
        return true;
        
      } catch (error) {
        console.error("Error saving expense from scan:", error);
        toast.error("Error processing receipt - please try again");
        
        // Even if an error occurred, still update the form if onCapture is provided
        if (onCapture && formattedItems.length > 0) {
          const firstItem = formattedItems[0];
          onCapture({
            description: firstItem.description,
            amount: firstItem.amount.toString(),
            date: firstItem.date,
            category: firstItem.category,
            paymentMethod: firstItem.paymentMethod
          });
        }
        return false;
      }
    } else {
      toast.error("No valid items found in receipt");
      return false;
    }
  } catch (error) {
    console.error("Error getting current user:", error);
    toast.error("Authentication error - please log in again");
    return false;
  }
}
