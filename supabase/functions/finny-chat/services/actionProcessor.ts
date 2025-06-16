
// Import Supabase client type
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Import action handlers
import { addExpense, updateExpense, deleteExpense } from "../actions/expenseActions.ts";
import { setBudget, deleteBudget } from "../actions/budgetActions.ts";
import { setGoal, updateGoal, deleteGoal } from "../actions/goalActions.ts";

// Process user actions
export async function processAction(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  if (!action || !action.type) {
    throw new Error("Invalid action format");
  }

  console.log("Processing action:", JSON.stringify(action, null, 2));

  try {
    switch (action.type) {
      case "add_expense":
        return await addExpense(action, userId, supabase);

      case "update_expense":
        return await updateExpense(action, userId, supabase);

      case "delete_expense":
        return await deleteExpense(action, userId, supabase);

      case "set_budget":
      case "update_budget":
        return await setBudget(action, userId, supabase);

      case "delete_budget":
        return await deleteBudget(action, userId, supabase);

      case "set_goal":
        return await setGoal(action, userId, supabase);

      case "update_goal":
        return await updateGoal(action, userId, supabase);

      case "delete_goal":
        return await deleteGoal(action, userId, supabase);

      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  } catch (error) {
    console.error(`Error processing ${action.type} action:`, error);
    throw new Error(`Failed to ${action.type.replace('_', ' ')}: ${error.message}`);
  }
}
