
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export async function setIncome(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  console.log(`Setting monthly income to: ${action.amount}`);
  
  // Update in the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      monthly_income: action.amount
    })
    .eq('id', userId);

  if (profileError) {
    console.error("Profile income update error:", profileError);
    throw profileError;
  }

  // Also update in budgets table as fallback
  const { error: budgetError } = await supabase
    .from('budgets')
    .upsert({
      user_id: userId,
      monthly_income: action.amount,
      category: 'income',
      period: 'monthly',
      amount: 0
    });

  if (budgetError) {
    console.warn('Could not update budgets table:', budgetError);
  }

  console.log("Income updated successfully");
  return `I've set your monthly income to ${action.amount}.`;
}
