
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { formatCurrency } from "../../functions/finny-chat/utils/formatters.ts";
import { format } from "https://esm.sh/date-fns@3.6.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface User {
  id: string;
  email: string;
  full_name: string;
  preferred_currency: string;
  notification_time: string;
  notification_timezone: string;
}

interface FinancialTip {
  id: string;
  category: string;
  tip_text: string;
}

// Handle HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || "",
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ""
    );

    console.log("Starting daily notification process");

    // Get all users with notifications enabled
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, preferred_currency, notification_time, notification_timezone')
      .eq('notifications_enabled', true);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users with notifications enabled`);

    const now = new Date();
    const dateToday = format(now, 'yyyy-MM-dd');
    const dateYesterday = format(new Date(now.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    // Process users whose notification time matches the current hour
    const results = await Promise.all((users || []).map(async (user: User) => {
      try {
        // Get yesterday's expenses for this user
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('amount, category')
          .eq('user_id', user.id)
          .eq('date', dateYesterday);

        if (expensesError) {
          console.error(`Error fetching expenses for user ${user.id}:`, expensesError);
          return { userId: user.id, success: false, error: expensesError.message };
        }

        // Calculate total spent
        const totalSpent = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
        
        // Get spending by category
        const categories: Record<string, number> = {};
        expenses?.forEach(expense => {
          categories[expense.category] = (categories[expense.category] || 0) + Number(expense.amount);
        });

        // Find top spending category
        let topCategory = "No expenses";
        let topAmount = 0;
        
        Object.entries(categories).forEach(([category, amount]) => {
          if (amount > topAmount) {
            topCategory = category;
            topAmount = amount;
          }
        });

        // Get random financial tip, preferring the top spending category if available
        let tipCategory = null;
        if (topCategory !== "No expenses" && Math.random() > 0.5) {
          // 50% chance to use the top category for tip selection
          tipCategory = topCategory.toLowerCase();
        }

        const { data: tipData } = await supabase
          .rpc('get_random_tip', { category_filter: tipCategory });
        
        const { data: tip, error: tipError } = await supabase
          .from('financial_tips')
          .select('id, category, tip_text')
          .eq('id', tipData)
          .single();

        if (tipError) {
          console.error(`Error fetching tip for user ${user.id}:`, tipError);
        }

        // Format and construct notification message
        const formattedTotal = formatCurrency(totalSpent, user.preferred_currency);
        const userName = user.full_name?.split(' ')[0] || 'there';
        
        const notificationMessage = `Hi ${userName}! You spent ${formattedTotal} yesterday. ${topCategory !== "No expenses" ? `Most spent on: ${topCategory}.` : ''} Tip: ${tip?.tip_text || 'Track your expenses daily for better financial awareness.'}`;

        // TODO: Send the actual email notification here
        // For now, just log the message and store notification history
        console.log(`Would send to ${user.email}: ${notificationMessage}`);

        // Record the notification in history
        const { error: historyError } = await supabase
          .from('notification_history')
          .insert({
            user_id: user.id,
            notification_type: 'daily_summary',
            expense_total: totalSpent,
            tip_id: tip?.id,
            email_sent: true
          });

        if (historyError) {
          console.error(`Error recording history for user ${user.id}:`, historyError);
          return { userId: user.id, success: false, error: historyError.message };
        }

        return { 
          userId: user.id, 
          success: true, 
          totalSpent,
          message: notificationMessage
        };
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        return { userId: user.id, success: false, error: error.message };
      }
    }));

    return new Response(
      JSON.stringify({
        message: `Processed notifications for ${users?.length || 0} users`,
        results
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
