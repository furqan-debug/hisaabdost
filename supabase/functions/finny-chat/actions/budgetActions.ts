
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export async function setBudget(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  // Check if budget exists
  const { data: existingBudget, error: fetchError } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", userId)
    .eq("category", action.category)
    .maybeSingle();

  if (fetchError) {
    console.error("Error checking for existing budget:", fetchError);
    throw fetchError;
  }

  // Set default period to "monthly" if not specified
  const period = action.period || "monthly";
  console.log(`Setting ${period} budget of ${action.amount} for ${action.category}`);

  // Update or insert based on existence
  if (existingBudget) {
    console.log("Updating existing budget for:", action.category);
    const { error } = await supabase
      .from("budgets")
      .update({ amount: action.amount, period: period })
      .eq("id", existingBudget.id);

    if (error) {
      console.error("Budget update error:", error);
      throw error;
    }
    console.log("Budget updated successfully");
    return `I've updated your ${action.category} budget to ${action.amount}.`;
  } else {
    console.log("Creating new budget for:", action.category);
    const { error } = await supabase.from("budgets").insert({
      user_id: userId,
      category: action.category,
      amount: action.amount,
      period: period,
      carry_forward: false
    });

    if (error) {
      console.error("Budget creation error:", error);
      throw error;
    }
    console.log("Budget created successfully");
    return `I've set a ${period} budget of ${action.amount} for ${action.category}.`;
  }
}

export async function deleteBudget(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  console.log(`Deleting budget for category: ${action.category}`);
  
  const { data, error } = await supabase
    .from("budgets")
    .delete()
    .eq("user_id", userId)
    .eq("category", action.category)
    .select();

  if (error) {
    console.error("Budget deletion error:", error);
    throw error;
  }

  if (data && data.length > 0) {
    console.log("Budget deleted successfully:", data);
    return `I've deleted the ${action.category} budget.`;
  } else {
    console.log("No budget found to delete for category:", action.category);
    return `I couldn't find a budget for ${action.category} to delete. Please check if the budget category is correct.`;
  }
}
