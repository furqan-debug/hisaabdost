
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExpenseItem {
  description: string;
  amount: string;
  date: string;
  category: string;
  paymentMethod: string;
  receiptUrl?: string | null;
  user_id?: string;
}

interface ReceiptData {
  items: ExpenseItem[];
  merchant: string;
  date: string;
}

/**
 * Save expense items from a receipt scan to the database
 */
export async function saveExpenseFromScan(receiptData: ReceiptData): Promise<boolean> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not authenticated, cannot save expenses");
      toast.error("Please log in to save expenses");
      return false;
    }
    
    // Format the items for database insertion
    const formattedItems = receiptData.items.map(item => ({
      user_id: user.id,
      description: item.description,
      amount: parseFloat(item.amount.toString().replace('$', '')),
      date: item.date,
      category: item.category || 'Food',
      receipt_url: item.receiptUrl || null,
      payment: item.paymentMethod, // Using payment column instead of paymentMethod
      is_recurring: false,
      created_at: new Date().toISOString()
    }));
    
    // Insert all items at once
    const { data, error } = await supabase
      .from('expenses')
      .insert(formattedItems);
    
    if (error) {
      console.error("Error saving expenses to database:", error);
      return false;
    }
    
    console.log("Successfully saved expenses from receipt");
    
    // Dispatch custom event to trigger expense list refresh
    const event = new CustomEvent('expenses-updated', { 
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error("Error in saveExpenseFromScan:", error);
    return false;
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);
    
    if (error) {
      console.error("Error deleting expense:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteExpense:", error);
    return false;
  }
}

/**
 * Get expenses for the current user
 */
export async function getUserExpenses(limit: number = 20): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getUserExpenses:", error);
    return [];
  }
}
