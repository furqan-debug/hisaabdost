
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export async function addWalletFunds(
  action: any,
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  console.log(`Adding wallet funds: ${action.amount} with description: ${action.description}`);
  
  // Get current date in user's timezone or UTC if not specified
  const currentDate = new Date();
  const dateToUse = action.date || currentDate.toISOString().split('T')[0];
  
  const { error } = await supabase.from("wallet_additions").insert({
    user_id: userId,
    amount: action.amount,
    description: action.description || "Added via Finny",
    date: dateToUse,
    fund_type: "finny" // Changed from "manual" to "finny"
  });

  if (error) {
    console.error("Wallet addition error:", error);
    throw error;
  }

  console.log("Wallet funds added successfully");
  return `I've added ${action.amount} to your wallet${action.description ? ` for ${action.description}` : ''}.`;
}
