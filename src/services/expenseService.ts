
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Expense } from "@/components/expenses/types";

interface ExpenseItem {
  description: string;
  amount: string;
  date: string;
  category: string;
  paymentMethod?: string;
  receiptUrl?: string;
  merchant?: string;
  notes?: string;
}

/**
 * Save a single expense to the database
 */
export async function saveExpense(expense: Expense): Promise<boolean> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to save expenses");
      return false;
    }

    const expenseData = {
      id: expense.id || uuidv4(),
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
      .upsert(expenseData);

    if (error) {
      console.error("Error saving expense:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in saveExpense:", error);
    return false;
  }
}

/**
 * Save multiple expenses from a receipt scan to the database
 */
export async function saveMultipleExpensesFromReceipt(expenses: ExpenseItem[]): Promise<boolean> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to save expenses");
      return false;
    }

    // Format expenses for database insertion
    const formattedExpenses = expenses.map(item => ({
      id: uuidv4(),
      user_id: user.id,
      amount: parseFloat(item.amount),
      description: item.description,
      date: item.date,
      category: item.category,
      payment: item.paymentMethod || "Card",
      notes: item.merchant ? `From: ${item.merchant}` : "",
      is_recurring: false,
      receipt_url: item.receiptUrl || null
    }));

    // Insert all expenses in a single operation
    const { error } = await supabase
      .from('expenses')
      .insert(formattedExpenses);

    if (error) {
      console.error("Error saving multiple expenses:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in saveMultipleExpensesFromReceipt:", error);
    return false;
  }
}

/**
 * Delete an expense from the database
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
 * Get all expenses for the current user
 */
export async function getUserExpenses(startDate?: string, endDate?: string) {
  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    // Add date filtering if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in getUserExpenses:", error);
    return [];
  }
}
