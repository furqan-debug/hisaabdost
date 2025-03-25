
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

/**
 * Saves all expenses extracted from a receipt scan
 */
export async function saveExpenseFromScan(scanResult: any): Promise<boolean> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to save expenses");
      return false;
    }

    // Make sure we have items to save
    if (!scanResult.items || !Array.isArray(scanResult.items) || scanResult.items.length === 0) {
      console.error("No valid items in scan result", scanResult);
      return false;
    }

    // Format the date from the receipt, using today as fallback
    const receiptDate = formatDate(scanResult.date);
    
    // Convert items to expense records
    const expenses = scanResult.items.map((item: any) => ({
      id: uuidv4(),
      user_id: user.id,
      amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
      description: item.name || "Store Purchase",
      date: receiptDate,
      category: item.category || "Other",
      payment: "Card", // Default to card for receipts
      notes: scanResult.merchant ? `From: ${scanResult.merchant}` : "",
      is_recurring: false,
      receipt_url: scanResult.receiptUrl || null
    }));

    // Insert all expenses in one operation
    const { error } = await supabase.from('expenses').insert(expenses);

    if (error) {
      console.error("Error saving expenses from receipt:", error);
      toast.error("Failed to save expenses from receipt.");
      return false;
    }

    console.log(`Successfully saved ${expenses.length} expense(s) from receipt`);
    return true;
  } catch (error) {
    console.error("Error in saveExpenseFromScan:", error);
    toast.error("An error occurred while saving expenses from receipt.");
    return false;
  }
}
