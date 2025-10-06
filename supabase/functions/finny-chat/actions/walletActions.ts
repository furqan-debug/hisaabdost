
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export async function addWalletFunds(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  console.log(`Adding wallet funds: ${action.amount} with description: ${action.description}`);
  
  // Always use today's date in the user's timezone
  const today = new Date();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const todayFormatted = new Intl.DateTimeFormat('en-CA', { 
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(today);
  
  const dateToUse = action.date || todayFormatted;
  
  const { error } = await supabase.from("wallet_additions").insert({
    user_id: userId,
    amount: action.amount,
    description: action.description || "Added via Finny",
    date: dateToUse,
    fund_type: "manual", // Change from "finny" to "manual" to match format expected by UI
    family_id: action.family_id || null
  });

  if (error) {
    console.error("Wallet addition error:", error);
    throw error;
  }

  console.log("Wallet funds added successfully");
  return `I've added ${action.amount} to your wallet${action.description ? ` for ${action.description}` : ''}.`;
}
