
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface User {
  id: string;
  email: string;
  monthly_income: number;
  notification_timezone: string;
  last_notification_date: string | null;
}

interface Expense {
  amount: number;
  category: string;
  date: string;
}

interface Budget {
  category: string;
  amount: number;
}

interface NotificationContext {
  totalSpent: number;
  budgetUtilization: number;
  spendingTrend: number;
  topCategory: string;
  daysInMonth: number;
  expenseCount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧠 Starting smart notifications analysis...');

    // Get current date info
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    const currentDate = now.toISOString().slice(0, 10); // YYYY-MM-DD

    // Get users who haven't received a notification today (more relaxed criteria)
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, monthly_income, notification_timezone, last_notification_date')
      .or(`last_notification_date.is.null,last_notification_date.neq.${currentDate}`);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users to analyze`);

    let notificationsSent = 0;
    const processedUsers = users?.length || 0;

    for (const user of users || []) {
      try {
        const sent = await processUserNotifications(supabaseAdmin, user, currentMonth, currentDate);
        if (sent) notificationsSent++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analyzed_users: processedUsers,
        notifications_sent: notificationsSent,
        automated: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Smart notifications error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function processUserNotifications(
  supabase: any, 
  user: User, 
  currentMonth: string, 
  currentDate: string
): Promise<boolean> {
  console.log(`Processing notifications for user: ${user.id}`);

  // Get user's expenses for current month
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category, date')
    .eq('user_id', user.id)
    .gte('date', `${currentMonth}-01`)
    .lte('date', `${currentMonth}-31`);

  // Get user's budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select('category, amount')
    .eq('user_id', user.id);

  // Get monthly income
  const { data: monthlyIncomeData } = await supabase
    .from('monthly_incomes')
    .select('income_amount')
    .eq('user_id', user.id)
    .eq('month_year', currentMonth)
    .maybeSingle();

  const monthlyIncome = monthlyIncomeData?.income_amount || user.monthly_income || 0;
  const expenseCount = expenses?.length || 0;

  console.log(`User ${user.id} financial data:`, {
    expenseCount,
    budgetCount: budgets?.length || 0,
    monthlyIncome,
    hasData: expenseCount > 0 || (budgets?.length || 0) > 0 || monthlyIncome > 0
  });

  // More relaxed criteria - send notification if user has ANY financial activity
  const hasAnyData = expenseCount > 0 || (budgets?.length || 0) > 0 || monthlyIncome > 0;
  
  if (!hasAnyData) {
    console.log(`No financial data for user ${user.id}, skipping`);
    return false;
  }

  // Calculate financial context
  const context = calculateFinancialContext(expenses || [], budgets || [], monthlyIncome);
  
  // Generate AI notification
  const notification = await generateSmartNotification(context, user);
  
  if (notification) {
    // Send actual push notification
    console.log(`📱 Sending notification to ${user.id}:`, notification);
    
    try {
      // Call the send-push-notification function
      const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user.id,
          title: getNotificationTitle(notification.type),
          body: notification.message,
          data: {
            type: notification.type,
            priority: notification.priority,
            context: context
          }
        }
      });

      if (pushError) {
        console.error(`Failed to send push notification to ${user.id}:`, pushError);
      } else {
        console.log(`✅ Push notification sent successfully to ${user.id}`);
      }
    } catch (error) {
      console.error(`Error sending push notification to ${user.id}:`, error);
    }
    
    // Store notification analytics
    await supabase
      .from('notification_analytics')
      .insert({
        user_id: user.id,
        notification_type: notification.type,
        priority_score: notification.priority,
        financial_context: context,
        ai_reasoning: notification.reasoning,
        user_timezone: user.notification_timezone || 'UTC'
      });

    // Update last notification date
    await supabase
      .from('profiles')
      .update({ last_notification_date: currentDate })
      .eq('id', user.id);

    return true;
  }

  return false;
}

function calculateFinancialContext(
  expenses: Expense[], 
  budgets: Budget[], 
  monthlyIncome: number
): NotificationContext {
  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  // Calculate budget utilization
  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Calculate spending trend (simplified - compare to previous period)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const expectedSpending = totalSpent > 0 ? (totalSpent / currentDay) * daysInMonth : 0;
  const spendingTrend = monthlyIncome > 0 ? ((expectedSpending - monthlyIncome) / monthlyIncome) * 100 : 0;

  // Find top spending category
  const categorySpending: Record<string, number> = {};
  expenses.forEach(exp => {
    categorySpending[exp.category] = (categorySpending[exp.category] || 0) + Number(exp.amount);
  });
  
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'General';

  return {
    totalSpent,
    budgetUtilization,
    spendingTrend,
    topCategory,
    daysInMonth,
    expenseCount: expenses.length
  };
}

async function generateSmartNotification(
  context: NotificationContext, 
  user: User
): Promise<{ type: string; priority: number; reasoning: string; message: string } | null> {
  
  // Determine notification type and priority
  let type = 'general';
  let priority = 1;
  let reasoning = '';
  let message = '';

  // More aggressive notification logic to ensure users get notifications
  if (context.budgetUtilization > 90) {
    type = 'budget';
    priority = 5;
    reasoning = `Budget utilization at ${context.budgetUtilization.toFixed(1)}% - urgent attention needed`;
    message = `🚨 Budget Alert: You've used ${context.budgetUtilization.toFixed(1)}% of your budget this month. Consider reviewing your ${context.topCategory} spending.`;
  } else if (context.spendingTrend > 20) {
    type = 'wastage';
    priority = 4;
    reasoning = `Spending trend shows ${context.spendingTrend.toFixed(1)}% over budget projection`;
    message = `⚠️ Spending Alert: Your current pace suggests you'll exceed your income by ${context.spendingTrend.toFixed(1)}%. Your top spending category is ${context.topCategory}.`;
  } else if (context.budgetUtilization > 70) {
    type = 'budget';
    priority = 3;
    reasoning = `Budget utilization at ${context.budgetUtilization.toFixed(1)}% - moderate concern`;
    message = `💡 Budget Update: You're at ${context.budgetUtilization.toFixed(1)}% of your monthly budget. Keep an eye on ${context.topCategory} expenses.`;
  } else if (context.expenseCount > 0 && context.totalSpent < user.monthly_income * 0.3) {
    type = 'savings';
    priority = 2;
    reasoning = `Low spending detected - opportunity for savings goals`;
    message = `🌟 Great Job! Your spending is well under control at $${context.totalSpent.toFixed(2)}. Consider setting aside some funds for your financial goals.`;
  } else if (context.expenseCount > 0) {
    // Default encouraging message for any user with expenses
    type = 'general';
    priority = 1;
    reasoning = 'Regular check-in to maintain financial awareness';
    message = `📊 Financial Update: You've spent $${context.totalSpent.toFixed(2)} this month, with most going to ${context.topCategory}. Keep tracking!`;
  } else {
    // Even for users with no expenses, send a motivating message
    type = 'general';
    priority = 1;
    reasoning = 'Encouraging user to start tracking expenses';
    message = `💪 Ready to Track? Start logging your expenses to get personalized insights and stay on top of your financial goals!`;
  }

  return { type, priority, reasoning, message };
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'budget':
      return '🎯 Budget Alert';
    case 'wastage':
      return '⚠️ Spending Alert';
    case 'savings':
      return '🌟 Savings Opportunity';
    case 'general':
      return '📊 Financial Update';
    default:
      return '💡 Smart Insight';
  }
}
