
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export interface ExpenseItem {
  description: string;
  amount: string | number;
  date: string;
  category: string;
  paymentMethod: string;
  receiptUrl?: string | null;
}

export interface ScanResult {
  items: ExpenseItem[];
  merchant?: string;
  date?: string;
}

export async function saveExpenseFromScan(scanResult: ScanResult): Promise<boolean> {
  try {
    console.log("Starting saveExpenseFromScan with:", scanResult);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to save expenses");
      console.error("User not authenticated");
      return false;
    }

    if (!scanResult.items || !Array.isArray(scanResult.items) || scanResult.items.length === 0) {
      console.error("No valid items in scan result", scanResult);
      toast.error("No valid items found in receipt");
      return false;
    }

    const expenses = scanResult.items.map((item) => {
      let amount = 0;
      if (typeof item.amount === 'string') {
        const cleanAmount = item.amount.replace(/[$,]/g, '');
        amount = parseFloat(cleanAmount);
        if (isNaN(amount)) {
          console.warn("Invalid amount detected:", item.amount);
          amount = 0;
        }
      } else if (typeof item.amount === 'number') {
        amount = item.amount;
      }
      
      const date = item.date || scanResult.date || new Date().toISOString().split('T')[0];
      
      return {
        id: uuidv4(),
        user_id: user.id,
        amount: amount,
        description: item.description || (scanResult.merchant ? `Purchase from ${scanResult.merchant}` : "Store Purchase"),
        date: date,
        category: item.category || "Other",
        payment: item.paymentMethod || "Card",
        notes: scanResult.merchant ? `From: ${scanResult.merchant}` : "",
        is_recurring: false,
        receipt_url: item.receiptUrl || null
      };
    });

    console.log("Saving expenses to database:", expenses);

    const validExpenses = expenses.filter(exp => 
      exp.description && 
      exp.amount > 0 && 
      exp.date && 
      exp.category
    );
    
    if (validExpenses.length === 0) {
      console.error("No valid expenses after filtering", expenses);
      toast.error("Failed to save expenses: No valid data extracted");
      return false;
    }

    const { error } = await supabase.from('expenses').insert(validExpenses);

    if (error) {
      console.error("Error saving expenses from receipt:", error);
      toast.error("Failed to save expenses from receipt");
      return false;
    }

    console.log(`Successfully saved ${validExpenses.length} expense(s) from receipt`);
    toast.success(`Successfully saved ${validExpenses.length} expense(s)`);
    return true;
  } catch (error) {
    console.error("Error in saveExpenseFromScan:", error);
    toast.error("An error occurred while saving expenses from receipt");
    return false;
  }
}

// Function to retry saving expenses with manual data
export async function saveManualExpenseFromReceipt(expenseData: {
  description: string;
  amount: string | number;
  date: string;
  category: string;
  paymentMethod: string;
  receiptUrl?: string | null;
}): Promise<boolean> {
  try {
    return await saveExpenseFromScan({
      items: [expenseData],
      date: expenseData.date
    });
  } catch (error) {
    console.error("Error in saveManualExpenseFromReceipt:", error);
    toast.error("Failed to save manual expense");
    return false;
  }
}
