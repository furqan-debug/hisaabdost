
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
  console.log("deleteGoal called with action:", JSON.stringify(action, null, 2));
  console.log("deleteGoal called with userId:", userId);

  // First, let's get all user's goals to help with deletion
  const { data: allGoals, error: fetchError } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId);

  if (fetchError) {
    console.error("Error fetching user goals:", fetchError);
    throw new Error("Failed to fetch goals for deletion");
  }

  console.log("User's current goals:", JSON.stringify(allGoals, null, 2));

  let query = supabase
    .from("goals")
    .delete()
    .eq("user_id", userId);
    
  let goalToDelete = null;
  
  if (action.id) {
    console.log("Deleting goal by ID:", action.id);
    query = query.eq("id", action.id);
    goalToDelete = allGoals?.find(g => g.id === action.id);
  } else if (action.title) {
    console.log("Deleting goal by title:", action.title);
    query = query.ilike("title", `%${action.title}%`);
    goalToDelete = allGoals?.find(g => g.title.toLowerCase().includes(action.title.toLowerCase()));
  } else {
    // If no specific goal is mentioned, try to delete the most recent one
    if (allGoals && allGoals.length > 0) {
      const mostRecentGoal = allGoals.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      console.log("No specific goal mentioned, deleting most recent:", mostRecentGoal.title);
      query = query.eq("id", mostRecentGoal.id);
      goalToDelete = mostRecentGoal;
    } else {
      throw new Error("No goals found to delete. Please specify a goal title or create a goal first.");
    }
  }
  
  console.log("Goal to be deleted:", JSON.stringify(goalToDelete, null, 2));
  
  const { data: deletedData, error } = await query.select();
  
  if (error) {
    console.error("Goal deletion error:", error);
    throw new Error(`Failed to delete goal: ${error.message}`);
  }
  
  console.log("Deletion result:", JSON.stringify(deletedData, null, 2));
  
  if (!deletedData || deletedData.length === 0) {
    if (action.title) {
      throw new Error(`No goal found with title containing "${action.title}".`);
    } else if (action.id) {
      throw new Error(`No goal found with ID "${action.id}".`);
    } else {
      throw new Error("No goals found to delete.");
    }
  }
  
  const deletedGoal = deletedData[0];
  console.log("Successfully deleted goal:", deletedGoal.title);
  
  return `I've successfully deleted the goal "${deletedGoal.title}".`;
}
