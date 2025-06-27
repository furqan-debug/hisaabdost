
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Expense } from "@/components/expenses/types";
import { offlineStorage } from "./offlineStorageService";

export async function saveExpenseOffline(expense: Expense): Promise<boolean> {
  try {
    // Check if user is authenticated and online
    const { data: { user } } = await supabase.auth.getUser();
    
    // If offline or no connection, save locally
    if (!navigator.onLine || !user) {
      console.log('Saving expense offline');
      offlineStorage.addToPendingSync('expense', expense);
      
      // Also update local offline data for immediate UI feedback
      const offlineData = offlineStorage.getOfflineData();
      offlineData.expenses.push(expense);
      offlineStorage.saveOfflineData(offlineData);
      
      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('pending-sync-updated'));
      
      toast.success("Expense saved offline. Will sync when online.");
      return true;
    }

    // If online, try to save to server
    const expenseData = {
      user_id: user.id,
      amount: parseFloat(expense.amount.toString()),
      description: expense.description,
      date: expense.date,
      category: expense.category,
      payment: expense.paymentMethod || "Cash",
      notes: expense.notes || "",
      is_recurring: expense.isRecurring || false,
      receipt_url: expense.receiptUrl || null
    };

    const { error } = await supabase
      .from('expenses')
      .insert([expenseData]);

    if (error) {
      // If server save fails, save offline
      console.log('Server save failed, saving offline:', error);
      offlineStorage.addToPendingSync('expense', expense);
      window.dispatchEvent(new CustomEvent('pending-sync-updated'));
      toast.success("Expense saved offline. Will sync when connection is restored.");
      return true;
    }

    return true;
  } catch (error) {
    // If any error occurs, save offline
    console.log('Error saving expense, storing offline:', error);
    offlineStorage.addToPendingSync('expense', expense);
    window.dispatchEvent(new CustomEvent('pending-sync-updated'));
    toast.success("Expense saved offline. Will sync when online.");
    return true;
  }
}
