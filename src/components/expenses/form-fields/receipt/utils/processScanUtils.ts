
import { formatDate } from './dateUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
 * Process the results of the receipt scan and save to database
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
  console.log("🔄 processScanResults: Starting to process scan result:", JSON.stringify(scanResult, null, 2));
  
  if (!scanResult || !scanResult.items || scanResult.items.length === 0) {
    console.log("❌ processScanResults: No items found in scan result");
    toast.error("No items found in receipt");
    return false;
  }
  
  // Get current date for fallback
  const today = new Date().toISOString().split('T')[0];
  const receiptDate = scanResult.date ? formatDate(scanResult.date) : today;
  console.log(`📅 processScanResults: Using receipt date: ${receiptDate}`);
  
  // Validate date is reasonable
  const receiptYear = new Date(receiptDate).getFullYear();
  const validatedReceiptDate = (receiptYear < 2020 || receiptYear > 2030) ? today : receiptDate;
  if (validatedReceiptDate !== receiptDate) {
    console.log(`⚠️ processScanResults: Date ${receiptDate} out of range, using ${validatedReceiptDate}`);
  }
  
  // Format items for database insertion
  const formattedItems = scanResult.items.map((item: any, index: number) => {
    const formattedItem = {
      description: item.description || (scanResult.merchant ? `Purchase from ${scanResult.merchant}` : "Store Purchase"),
      amount: parseFloat(item.amount?.toString().replace('$', '') || scanResult.total?.toString() || "0.00"),
      date: formatDate(item.date || validatedReceiptDate),
      category: item.category || "Food", // Default to Food
      paymentMethod: item.paymentMethod || "Card", // Default assumption for receipts
      receiptUrl: scanResult.receiptUrl || null
    };
    
    console.log(`📦 processScanResults: Formatted item ${index + 1}:`, formattedItem);
    return formattedItem;
  });
  
  console.log(`📋 processScanResults: ${formattedItems.length} items ready for database insertion`);
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ processScanResults: User not authenticated");
      toast.error("Please log in to save expenses");
      
      // Still update form with first item if onCapture provided
      if (onCapture && formattedItems.length > 0) {
        const firstItem = formattedItems[0];
        console.log("📝 processScanResults: Updating form with first item (no auth)");
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
    
    console.log(`👤 processScanResults: Authenticated user: ${user.id}`);
    
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
    
    console.log(`💾 processScanResults: Inserting ${expenseData.length} expenses into database:`, expenseData);
    
    // Insert expenses into database
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select('id, description, amount');
    
    if (error) {
      console.error("💥 processScanResults: Database error:", error);
      toast.error(`Failed to save expenses: ${error.message}`);
      
      // Still update form if onCapture provided
      if (onCapture && formattedItems.length > 0) {
        const firstItem = formattedItems[0];
        console.log("📝 processScanResults: Updating form with first item (db error)");
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
    
    console.log("✅ processScanResults: Successfully saved expenses to database:", data);
    
    const itemText = formattedItems.length === 1 ? "expense" : "expenses";
    toast.success(`Successfully saved ${formattedItems.length} ${itemText} from receipt!`);
    
    // Dispatch immediate refresh events
    console.log("📡 processScanResults: Dispatching immediate refresh events...");
    
    window.dispatchEvent(new CustomEvent('expenses-updated', { 
      detail: { 
        timestamp: Date.now(), 
        count: formattedItems.length,
        action: 'receipt-scan'
      }
    }));
    
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
      console.log("📡 processScanResults: Dispatched delayed refresh event");
    }, 500);
    
    // Update form with first item if onCapture provided
    if (onCapture && formattedItems.length > 0) {
      const firstItem = formattedItems[0];
      console.log("📝 processScanResults: Updating form with first item (success)");
      onCapture({
        description: firstItem.description,
        amount: firstItem.amount.toString(),
        date: firstItem.date,
        category: firstItem.category,
        paymentMethod: firstItem.paymentMethod
      });
    }
    
    // Close dialog after short delay
    if (setOpen) {
      setTimeout(() => {
        console.log("🚪 processScanResults: Closing scan dialog");
        setOpen(false);
      }, 2000);
    }
    
    return true;
    
  } catch (error) {
    console.error("💥 processScanResults: Unexpected error:", error);
    toast.error("Error processing receipt - please try again");
    
    // Still update form if onCapture provided
    if (onCapture && formattedItems.length > 0) {
      const firstItem = formattedItems[0];
      console.log("📝 processScanResults: Updating form with first item (error)");
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
}
