
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export async function setIncome(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  console.log(`Setting monthly income to: ${action.amount}`);
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  try {
    // Update in the new monthly_incomes table
    const { error: monthlyIncomeError } = await supabase
      .from('monthly_incomes')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        income_amount: parseFloat(action.amount)
      });

    if (monthlyIncomeError) {
      console.error("Monthly income update error:", monthlyIncomeError);
      throw monthlyIncomeError;
    }

    // Also update in the profiles table for backward compatibility
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        monthly_income: parseFloat(action.amount)
      })
      .eq('id', userId);

    if (profileError) {
      console.warn("Profile income update warning:", profileError);
    }

    console.log("Income updated successfully for month:", currentMonth);
    return `I've set your monthly income to ${action.amount} for ${currentMonth}.`;
  } catch (error) {
    console.error("Error setting income:", error);
    return `I couldn't set your income: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
