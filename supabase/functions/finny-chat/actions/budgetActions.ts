
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Helper function to log budget activity
async function logBudgetActivity(
  supabase: SupabaseClient,
  userId: string,
  action: 'set' | 'updated' | 'deleted',
  budget: {
    category: string;
    amount: number;
    period: string;
    id?: string;
  }
) {
  try {
    const actionDescription = action === 'set' 
      ? `Set ${budget.category} budget for ${budget.period}`
      : action === 'updated'
      ? `Updated ${budget.category} budget for ${budget.period}`
      : `Deleted ${budget.category} budget`;

    await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action_type: 'budget',
        action_description: actionDescription,
        amount: budget.amount,
        category: budget.category,
        metadata: { budget_id: budget.id }
      });
  } catch (error) {
    console.error('Failed to log budget activity:', error);
  }
}

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
    
    // Log budget update activity
    await logBudgetActivity(supabase, userId, 'updated', {
      category: action.category,
      amount: action.amount,
      period: period,
      id: existingBudget.id
    });
    
    console.log("Budget updated successfully");
    return `I've updated your ${action.category} budget to ${action.amount}.`;
  } else {
    console.log("Creating new budget for:", action.category);
    
    // Add retry logic for budget creation
    let retryCount = 0;
    const maxRetries = 3;
    let newBudget;
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase.from("budgets").insert({
          user_id: userId,
          category: action.category,
          amount: action.amount,
          period: period,
          carry_forward: false,
          family_id: action.family_id || null
        }).select().single();

        if (error) {
          throw error;
        }
        
        newBudget = data;
        break;
      } catch (error) {
        retryCount++;
        console.warn(`Budget creation attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          console.error("Final budget creation error after retries:", error);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // Log budget creation activity
    await logBudgetActivity(supabase, userId, 'set', {
      category: action.category,
      amount: action.amount,
      period: period,
      id: newBudget?.id
    });
    
    console.log("Budget created successfully after", retryCount + 1, "attempts");
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
    // Log budget deletion activity
    await logBudgetActivity(supabase, userId, 'deleted', {
      category: action.category,
      amount: data[0].amount,
      period: data[0].period,
      id: data[0].id
    });
    
    console.log("Budget deleted successfully:", data);
    return `I've deleted the ${action.category} budget.`;
  } else {
    console.log("No budget found to delete for category:", action.category);
    return `I couldn't find a budget for ${action.category} to delete. Please check if the budget category is correct.`;
  }
}
