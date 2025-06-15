
import { supabase } from "@/integrations/supabase/client";
import { offlineStorage } from "@/utils/offlineStorage";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface OfflineExpense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  paymentMethod: string;
  notes?: string;
  isRecurring: boolean;
  receiptUrl?: string;
  user_id: string;
}

export async function saveExpenseOfflineAware(expense: OfflineExpense): Promise<boolean> {
  try {
    // Try online save first
    if (navigator.onLine) {
      const { error } = await supabase
        .from('expenses')
        .insert({
          id: expense.id,
          user_id: expense.user_id,
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
          category: expense.category,
          payment: expense.paymentMethod,
          notes: expense.notes || "",
          is_recurring: expense.isRecurring,
          receipt_url: expense.receiptUrl || null
        });

      if (error) {
        throw error;
      }

      toast.success("Expense saved successfully!");
      return true;
    } else {
      // Save offline
      await offlineStorage.storeOfflineAction({
        id: expense.id,
        data: expense,
        timestamp: Date.now(),
        type: 'expense',
        action: 'create'
      });

      toast.success("Expense saved offline. Will sync when online.");
      return true;
    }
  } catch (error) {
    console.error("Error saving expense:", error);
    
    // Fallback to offline storage if online save fails
    try {
      await offlineStorage.storeOfflineAction({
        id: expense.id,
        data: expense,
        timestamp: Date.now(),
        type: 'expense',
        action: 'create'
      });

      toast.warning("Saved offline due to connection issue. Will sync later.");
      return true;
    } catch (offlineError) {
      console.error("Offline save also failed:", offlineError);
      toast.error("Failed to save expense");
      return false;
    }
  }
}

export async function syncOfflineExpenses(): Promise<void> {
  try {
    const pendingExpenses = await offlineStorage.getPendingActions('expense');
    
    if (pendingExpenses.length === 0) {
      console.log("No pending expenses to sync");
      return;
    }

    console.log(`Syncing ${pendingExpenses.length} offline expenses`);

    for (const item of pendingExpenses) {
      try {
        if (item.action === 'create') {
          const { error } = await supabase
            .from('expenses')
            .insert({
              id: item.data.id,
              user_id: item.data.user_id,
              amount: item.data.amount,
              description: item.data.description,
              date: item.data.date,
              category: item.data.category,
              payment: item.data.paymentMethod,
              notes: item.data.notes || "",
              is_recurring: item.data.isRecurring,
              receipt_url: item.data.receiptUrl || null
            });

          if (error) {
            console.error("Error syncing expense:", error);
            continue;
          }
        }
        // Handle other actions (update, delete) as needed
      } catch (error) {
        console.error("Error syncing individual expense:", error);
        continue;
      }
    }

    // Clear synced expenses
    await offlineStorage.clearPendingActions('expense');
    
    // Dispatch event to refresh UI
    window.dispatchEvent(new CustomEvent('expenses-updated', {
      detail: { timestamp: Date.now(), source: 'offline-sync' }
    }));

    console.log("Offline expenses synced successfully");
  } catch (error) {
    console.error("Error syncing offline expenses:", error);
  }
}
