import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { validateAndFormatDate, getTodaysDate } from "../utils/dateUtils.ts";

// Helper function to log expense activity
async function logExpenseActivity(
  supabase: SupabaseClient,
  userId: string,
  action: 'added' | 'updated' | 'deleted',
  expense: {
    description: string;
    amount: number;
    category: string;
    id?: string;
  }
) {
  try {
    const actionDescription = `${action.charAt(0).toUpperCase() + action.slice(1)} ${expense.description} expense`;

    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action_type: 'expense',
        action_description: actionDescription,
        amount: expense.amount,
        category: expense.category,
        metadata: { expense_id: expense.id }
      });
  } catch (error) {
    console.error('Failed to log expense activity:', error);
  }
}

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
    family_id: action.family_id || null,
  };

  console.log(`Inserting expense with data:`, JSON.stringify(expenseData, null, 2));
  
  // Add retry logic for expense creation
  let retryCount = 0;
  const maxRetries = 3;
  let data;
  
  while (retryCount < maxRetries) {
    try {
      const result = await supabase
        .from("expenses")
        .insert(expenseData)
        .select();

      if (result.error) {
        throw result.error;
      }
      
      data = result.data;
      break;
    } catch (error) {
      retryCount++;
      console.warn(`Expense creation attempt ${retryCount} failed:`, error);
      
      if (retryCount >= maxRetries) {
        console.error("Final expense creation error after retries:", error);
        throw new Error(`Failed to save expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  if (!data || data.length === 0) {
    console.error("No data returned after expense insertion");
    throw new Error("Expense was not saved properly");
  }

  console.log("Expense added successfully after", retryCount + 1, "attempts:", JSON.stringify(data[0], null, 2));

  // Log expense creation activity
  await logExpenseActivity(supabase, userId, 'added', {
    description: action.description || action.category,
    amount: amount,
    category: action.category,
    id: data[0].id
  });

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
  
  const { data, error } = await supabase
    .from("expenses")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating expense:", error);
    throw error;
  }

  // Log expense update activity
  await logExpenseActivity(supabase, userId, 'updated', {
    description: data.description,
    amount: data.amount,
    category: data.category,
    id: data.id
  });

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
    // Get expense data before deleting for logging
    const { data: expenseData, error: fetchError } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", action.id)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching expense for deletion:", fetchError);
      throw fetchError;
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", action.id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting expense by ID:", error);
      throw error;
    }

    // Log expense deletion activity
    await logExpenseActivity(supabase, userId, 'deleted', {
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
      id: expenseData.id
    });

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
