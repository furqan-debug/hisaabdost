
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { parseGoalDeadline } from "../utils/dateUtils.ts";

export async function setGoal(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  // Parse and validate the deadline
  let deadlineDate: string | null = null;
  
  if (action.deadline) {
    deadlineDate = parseGoalDeadline(action.deadline);
  } else {
    // Set a default deadline of 3 months from now if not provided
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    deadlineDate = threeMonthsLater.toISOString().split('T')[0];
  }

  // Ensure target_amount is a positive number
  const targetAmount = Math.abs(Number(action.targetAmount) || 0);
  
  if (targetAmount <= 0) {
    throw new Error("Target amount must be greater than 0");
  }

  // Insert the goal with proper values
  const { error } = await supabase.from("goals").insert({
    user_id: userId,
    title: action.title || "Savings Goal",
    target_amount: targetAmount,
    current_amount: 0, // Always start with 0, must be non-negative
    deadline: deadlineDate,
    category: action.category || "Savings",
  });

  if (error) {
    console.error("Goal creation error:", error);
    throw error;
  }

  console.log("Goal created successfully");
  return `I've created your ${action.title || 'savings'} goal of ${targetAmount} to reach by ${deadlineDate}.`;
}

export async function updateGoal(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  const updateData: any = {};
  
  // Only include fields that are provided
  if (action.title) updateData.title = action.title;
  if (action.targetAmount !== undefined) {
    const targetAmount = Math.abs(Number(action.targetAmount) || 0);
    if (targetAmount > 0) {
      updateData.target_amount = targetAmount;
    }
  }
  if (action.currentAmount !== undefined) {
    // Ensure current_amount is non-negative
    const currentAmount = Math.max(0, Number(action.currentAmount) || 0);
    updateData.current_amount = currentAmount;
  }
  if (action.category) updateData.category = action.category;
  
  // Parse deadline if provided
  if (action.deadline) {
    updateData.deadline = parseGoalDeadline(action.deadline);
  }
  
  // Update the goal
  const { error } = await supabase
    .from("goals")
    .update(updateData)
    .eq("id", action.id)
    .eq("user_id", userId);

  if (error) {
    console.error("Goal update error:", error);
    throw error;
  }
  
  console.log("Goal updated successfully");
  return `I've updated your savings goal.`;
}

export async function deleteGoal(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  let query = supabase
    .from("goals")
    .delete()
    .eq("user_id", userId);
    
  if (action.id) {
    query = query.eq("id", action.id);
  } else if (action.title) {
    query = query.ilike("title", `%${action.title}%`);
  } else {
    throw new Error("Please provide a goal ID or title to delete.");
  }
  
  const { error } = await query;
  if (error) {
    console.error("Goal deletion error:", error);
    throw error;
  }
  
  console.log("Goal deleted successfully");
  return `I've deleted the goal for you.`;
}
