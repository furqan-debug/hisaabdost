import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { validateAndFormatDate, getTodaysDate } from "../utils/dateUtils.ts";

export async function addExpense(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  // Validate required fields
  if (!action.amount || !action.category) {
    throw new Error("Amount and category are required for adding expense");
  }

  // Validate and ensure correct date format
  const validatedDate = validateAndFormatDate(action.date);
  
  // Ensure amount is a valid number
  const amount = parseFloat(action.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount provided");
  }
  
  // Always log the expense data being inserted
  const expenseData = {
    user_id: userId,
    amount: amount,
    category: action.category,
    description: action.description || action.category,
    date: validatedDate,
    payment: action.paymentMethod || "Cash", // Use 'payment' not 'payment_method'
    notes: action.notes || null,
    is_recurring: action.isRecurring || false,
  };

  console.log(`Inserting expense with data:`, JSON.stringify(expenseData, null, 2));
  
  // Insert the expense
  const { data, error } = await supabase
    .from("expenses")
    .insert(expenseData)
    .select();

  if (error) {
    console.error("Error inserting expense:", error);
    throw new Error(`Failed to save expense: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error("No data returned after expense insertion");
    throw new Error("Expense was not saved properly");
  }

  console.log("Expense added successfully:", JSON.stringify(data[0], null, 2));

  // Format response based on action details
  const formattedDate = validatedDate === getTodaysDate() 
    ? "today" 
    : `on ${validatedDate}`;
    
  return `I've successfully added the ${action.category} expense of ${action.amount} for ${action.description || action.category} ${formattedDate}. The expense has been saved to your records.`;
}

export async function updateExpense(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  const { id, ...updateData } = action;
  
  // Validate date if present in the update
  if (updateData.date) {
    updateData.date = validateAndFormatDate(updateData.date);
  }
  
  // Fix payment method field name
  if (updateData.paymentMethod) {
    updateData.payment = updateData.paymentMethod;
    delete updateData.paymentMethod;
  }
  
  const { error } = await supabase
    .from("expenses")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating expense:", error);
    throw error;
  }

  console.log("Expense updated successfully");
  return `I've updated the expense details for you.`;
}

export async function deleteExpense(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  // Delete by exact ID if provided
  if (action.id) {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", action.id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting expense by ID:", error);
      throw error;
    }

    console.log("Expense deleted successfully by ID");
    return `I've deleted the expense for you.`;
  } 
  // Delete by category & date
  else if (action.category) {
    let query = supabase
      .from("expenses")
      .delete()
      .eq("user_id", userId)
      .eq("category", action.category);

    // Add date filter if provided
    if (action.date) {
      const validDate = validateAndFormatDate(action.date);
      query = query.eq("date", validDate);
    }

    // Add limit to prevent accidental mass deletion
    query = query.limit(1);

    const { error } = await query;
    if (error) {
      console.error("Error deleting expense by category:", error);
      throw error;
    }

    console.log("Expense deleted successfully by category");
    const dateMsg = action.date ? ` from ${action.date}` : "";
    return `I've deleted the ${action.category} expense${dateMsg}.`;
  } else {
    throw new Error("Not enough information to delete an expense.");
  }
}
