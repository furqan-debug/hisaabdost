
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// This hook handles the actual process of adding expenses to the database
export function useScanProcess() {
  // Helper function to add expenses to the database
  const addExpensesToDatabase = useCallback(async (
    items: Array<{
      description: string;
      amount: string;
      date: string;
      category: string;
      paymentMethod: string;
    }>, 
    updateProgress: (progress: number, message?: string) => void
  ) => {
    if (!items || items.length === 0) {
      console.error("No items to add to database");
      return false;
    }
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return false;
      }
      
      updateProgress(95, `Adding ${items.length} expenses to your list...`);
      
      // Format the items for the expenses table
      const expenses = items.map(item => ({
        user_id: user.id,
        description: item.description || "Store Purchase",
        amount: parseFloat(item.amount.replace(/[^0-9.]/g, '')) || 0,
        date: item.date || new Date().toISOString().split('T')[0],
        category: item.category || 'Food',
        is_recurring: false,
        receipt_url: null,
        payment: item.paymentMethod || 'Card', // Match the DB column name
        created_at: new Date().toISOString()
      }));
      
      console.log("Adding expenses to database:", expenses);
      
      // Insert all expenses
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenses)
        .select();
      
      if (error) {
        console.error("Error saving expenses:", error);
        toast.error(`Failed to save expenses: ${error.message}`);
        return false;
      } else {
        console.log("Expenses saved successfully:", data);
        const itemText = expenses.length === 1 ? "expense" : "expenses";
        toast.success(`Added ${expenses.length} ${itemText} from your receipt`, {
          description: "Check your expenses list to see them",
          duration: 5000
        });
        
        // Trigger a refresh of the expenses list - dispatch event with a delay
        setTimeout(() => {
          const event = new CustomEvent('expenses-updated', {
            detail: { timestamp: Date.now(), count: expenses.length }
          });
          window.dispatchEvent(event);
          console.log("Dispatched expenses-updated event after database insert");
        }, 500);
        
        return true;
      }
    } catch (error) {
      console.error("Error in addExpensesToDatabase:", error);
      toast.error("Failed to save expenses");
      return false;
    }
  }, []);

  return { addExpensesToDatabase };
}
