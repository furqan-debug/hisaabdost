
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { findMainItem } from "../utils/itemSelectionUtils";
import { formatDate } from "../utils/dateUtils";
import { formatDescription } from "../utils/itemSelectionUtils";

/**
 * Save an expense from scan data to the database
 */
export async function saveExpenseFromScan(scanData: any): Promise<boolean> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("User not authenticated, skipping auto-save");
      return false;
    }
    
    // Find the most relevant item (usually the most expensive one)
    const mainItem = findMainItem(scanData.items);
    if (!mainItem) {
      return false;
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
      return false;
    }
    
    toast.success("Receipt scanned and expense added automatically");
    return true;
    
  } catch (error) {
    console.error("Error auto-saving expense:", error);
    return false;
  }
}
