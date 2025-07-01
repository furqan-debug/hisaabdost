
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserData {
  id: string;
  preferred_currency: string;
  age: number;
  full_name: string;
  monthly_income: number;
  last_login_at: string;
  last_notification_date?: string;
  timezone?: string;
}

interface ExpenseData {
  amount: number;
  category: string;
  date: string;
  description: string;
  payment_method: string;
}

interface BudgetData {
  category: string;
  amount: number;
  spent: number;
  period: string;
}

interface GoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  status: string;
}

interface WalletData {
  balance: number;
  recent_transactions: Array<{
    amount: number;
    type: string;
    date: string;
  }>;
}

interface SmartNotification {
  title: string;
  body: string;
  priority: number;
  type: 'budget' | 'goal' | 'wastage' | 'inactivity' | 'savings' | 'achievement';
  reasoning: string;
  financial_context: Record<string, any>;
}

const NOTIFICATION_PRIORITIES = {
  budget: 1,      // Critical - budget alerts
  goal: 2,        // Important - goal updates
  wastage: 3,     // Moderate - wasteful spending
  savings: 4,     // Good - savings opportunities
  achievement: 5, // Positive - achievements
  inactivity: 6   // Low - inactivity reminders
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const requestBody = await req.json().catch(() => ({}));
    const isAutomated = requestBody.automated === true;

    console.log(`🚀 ${isAutomated ? 'Automated' : 'Manual'} smart notification analysis started...`);

    // Get all users eligible for notifications
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, preferred_currency, age, full_name, monthly_income, last_login_at, last_notification_date, timezone');

    if (usersError) {
      throw usersError;
    }

    console.log(`📊 Analyzing ${users?.length || 0} users for smart notifications`);

    const notifications: Array<{
      userId: string;
      notification: SmartNotification;
    }> = [];

    for (const user of users || []) {
      try {
        // Enforce daily limit - skip if already sent today
        const today = new Date().toISOString().split('T')[0];
        if (user.last_notification_date === today) {
          console.log(`⏭️ Skipping user ${user.id} - already notified today`);
          continue;
        }

        // Get comprehensive financial data
        const financialData = await getComprehensiveFinancialData(supabase, user);
        
        // Use DeepSeek AI to analyze and generate the best notification
        const smartNotification = await generateIntelligentNotification(
          user, 
          financialData, 
          openrouterApiKey
        );

        if (smartNotification) {
          notifications.push({
            userId: user.id,
            notification: smartNotification
          });
        }
      } catch (error) {
        console.error(`❌ Error analyzing user ${user.id}:`, error);
      }
    }

    console.log(`🎯 Generated ${notifications.length} intelligent notifications`);

    // Send notifications and track analytics
    let sentCount = 0;
    for (const { userId, notification } of notifications) {
      try {
        // Send push notification
        const { error: sendError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            userId,
            title: notification.title,
            body: notification.body,
            data: {
              type: notification.type,
              priority: notification.priority,
              automated: isAutomated
            }
          }
        });

        if (!sendError) {
          const today = new Date().toISOString().split('T')[0];
          
          // Update last notification date
          await supabase
            .from('profiles')
            .update({ last_notification_date: today })
            .eq('id', userId);

          // Track analytics
          await supabase
            .from('notification_analytics')
            .insert({
              user_id: userId,
              notification_type: notification.type,
              priority_score: notification.priority,
              financial_context: notification.financial_context,
              ai_reasoning: notification.reasoning
            });

          sentCount++;
          console.log(`✅ Sent ${notification.type} notification to user ${userId}: ${notification.title}`);
        } else {
          console.error(`❌ Failed to send notification to user ${userId}:`, sendError);
        }
      } catch (error) {
        console.error(`❌ Error sending notification to user ${userId}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analyzed_users: users?.length || 0,
        notifications_generated: notifications.length,
        notifications_sent: sentCount,
        automated: isAutomated
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in smart-push-notifications function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function getComprehensiveFinancialData(supabase: any, user: UserData) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get expenses (last 60 days for trend analysis)
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category, date, description, payment_method')
    .eq('user_id', user.id)
    .gte('date', sixtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // Get budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select('category, amount, period')
    .eq('user_id', user.id);

  // Get goals
  const { data: goals } = await supabase
    .from('goals')
    .select('id, name, target_amount, current_amount, target_date, category, status')
    .eq('user_id', user.id);

  // Get wallet data
  const { data: walletTransactions } = await supabase
    .from('wallet_transactions')
    .select('amount, type, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Calculate spending by category for last 30 days
  const recentExpenses = expenses?.filter(e => 
    new Date(e.date) >= thirtyDaysAgo
  ) || [];

  const categorySpending = recentExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate spending trends (last 30 vs previous 30 days)
  const previousMonthExpenses = expenses?.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate >= sixtyDaysAgo && expenseDate < thirtyDaysAgo;
  }) || [];

  const currentMonthTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const previousMonthTotal = previousMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    expenses: recentExpenses,
    previousMonthExpenses,
    budgets: budgets || [],
    goals: goals || [],
    walletTransactions: walletTransactions || [],
    categorySpending,
    currentMonthTotal,
    previousMonthTotal,
    spendingTrend: previousMonthTotal > 0 ? 
      ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0
  };
}

async function generateIntelligentNotification(
  user: UserData,
  financialData: any,
  openrouterApiKey: string
): Promise<SmartNotification | null> {
  try {
    // Analyze financial situation comprehensively
    const insights = analyzeFinancialSituation(user, financialData);
    
    if (!insights.shouldNotify) {
      console.log(`💡 No notification needed for user ${user.id} - ${insights.reason}`);
      return null;
    }

    const language = getLanguageFromCurrency(user.preferred_currency);
    const ageGroup = getAgeGroup(user.age);

    // Create comprehensive prompt for DeepSeek
    const prompt = createIntelligentPrompt(user, financialData, insights, language, ageGroup);

    const response = await callDeepSeekAPI(prompt, openrouterApiKey);
    
    return {
      ...response,
      priority: NOTIFICATION_PRIORITIES[insights.primaryType] || 6,
      type: insights.primaryType,
      reasoning: insights.reasoning,
      financial_context: {
        totalSpent: financialData.currentMonthTotal,
        budgetUtilization: insights.budgetUtilization,
        goalProgress: insights.goalProgress,
        spendingTrend: financialData.spendingTrend,
        topCategories: insights.topSpendingCategories
      }
    };
  } catch (error) {
    console.error('Error generating intelligent notification:', error);
    return null;
  }
}

function analyzeFinancialSituation(user: UserData, data: any) {
  const insights = {
    shouldNotify: false,
    primaryType: 'inactivity' as const,
    reasoning: '',
    budgetUtilization: 0,
    goalProgress: 0,
    topSpendingCategories: [],
    urgentBudgets: [],
    delayedGoals: [],
    wastefulPatterns: []
  };

  // 1. BUDGET ANALYSIS (Highest Priority)
  if (data.budgets.length > 0) {
    const budgetAnalysis = data.budgets.map((budget: any) => {
      const spent = data.categorySpending[budget.category] || 0;
      const utilization = (spent / budget.amount) * 100;
      return { ...budget, spent, utilization };
    });

    const urgentBudgets = budgetAnalysis.filter((b: any) => b.utilization >= 70);
    if (urgentBudgets.length > 0) {
      insights.shouldNotify = true;
      insights.primaryType = 'budget';
      insights.reasoning = `Budget alert: ${urgentBudgets.length} categories over 70% utilization`;
      insights.urgentBudgets = urgentBudgets;
      insights.budgetUtilization = Math.max(...urgentBudgets.map((b: any) => b.utilization));
      return insights;
    }
  }

  // 2. GOAL ANALYSIS (Second Priority)
  if (data.goals.length > 0) {
    const goalAnalysis = data.goals.map((goal: any) => {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      const daysToTarget = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const isDelayed = daysToTarget < 30 && progress < 80;
      return { ...goal, progress, daysToTarget, isDelayed };
    });

    const delayedGoals = goalAnalysis.filter((g: any) => g.isDelayed);
    const nearCompletion = goalAnalysis.filter((g: any) => g.progress >= 90);

    if (delayedGoals.length > 0) {
      insights.shouldNotify = true;
      insights.primaryType = 'goal';
      insights.reasoning = `Goal alert: ${delayedGoals.length} goals at risk of missing deadline`;
      insights.delayedGoals = delayedGoals;
      return insights;
    }

    if (nearCompletion.length > 0) {
      insights.shouldNotify = true;
      insights.primaryType = 'achievement';
      insights.reasoning = `Achievement: ${nearCompletion.length} goals near completion`;
      insights.goalProgress = Math.max(...nearCompletion.map((g: any) => g.progress));
      return insights;
    }
  }

  // 3. WASTAGE ANALYSIS (Third Priority)
  const wastefulCategories = ['Entertainment', 'Food', 'Shopping', 'Miscellaneous'];
  const potentialWaste = data.expenses.filter((expense: any) => 
    wastefulCategories.includes(expense.category) && expense.amount > (user.monthly_income * 0.02)
  );

  if (potentialWaste.length >= 3) {
    const wasteAmount = potentialWaste.reduce((sum: number, e: any) => sum + e.amount, 0);
    if (wasteAmount > user.monthly_income * 0.1) {
      insights.shouldNotify = true;
      insights.primaryType = 'wastage';
      insights.reasoning = `Wastage detected: ${wasteAmount.toFixed(2)} in potentially unnecessary expenses`;
      insights.wastefulPatterns = potentialWaste;
      return insights;
    }
  }

  // 4. SAVINGS OPPORTUNITY (Fourth Priority)
  if (data.spendingTrend < -10) {
    insights.shouldNotify = true;
    insights.primaryType = 'savings';
    insights.reasoning = `Savings opportunity: Spending decreased by ${Math.abs(data.spendingTrend).toFixed(1)}%`;
    return insights;
  }

  // 5. INACTIVITY (Lowest Priority)
  if (user.last_login_at) {
    const daysSinceLogin = (Date.now() - new Date(user.last_login_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin >= 3) {
      insights.shouldNotify = true;
      insights.primaryType = 'inactivity';
      insights.reasoning = `Inactivity: ${Math.floor(daysSinceLogin)} days since last login`;
      return insights;
    }
  }

  insights.reasoning = 'No significant financial events requiring notification';
  return insights;
}

function createIntelligentPrompt(user: UserData, data: any, insights: any, language: string, ageGroup: string) {
  const context = `
Financial Profile:
- User: ${user.full_name || 'User'} (${ageGroup}, ${language})
- Currency: ${user.preferred_currency}
- Monthly Income: ${user.monthly_income}
- Current Month Spending: ${data.currentMonthTotal}
- Spending Trend: ${data.spendingTrend > 0 ? '+' : ''}${data.spendingTrend.toFixed(1)}%

Analysis: ${insights.reasoning}
Priority: ${insights.primaryType.toUpperCase()}

Context Details:
${insights.urgentBudgets.length > 0 ? `Urgent Budgets: ${insights.urgentBudgets.map((b: any) => `${b.category}: ${b.utilization.toFixed(1)}% used`).join(', ')}` : ''}
${insights.delayedGoals.length > 0 ? `Delayed Goals: ${insights.delayedGoals.map((g: any) => `${g.name}: ${g.progress.toFixed(1)}% complete, ${g.daysToTarget} days left`).join(', ')}` : ''}
${insights.goalProgress > 0 ? `Achievement Progress: ${insights.goalProgress.toFixed(1)}% complete` : ''}
${insights.wastefulPatterns.length > 0 ? `Top Wasteful Expenses: ${insights.wastefulPatterns.slice(0, 3).map((e: any) => `${e.description}: ${e.amount}`).join(', ')}` : ''}
`;

  return `You are DeepSeek, an advanced AI financial advisor. Create ONE perfect notification for this user.

${context}

Requirements:
- Be personal, insightful, and actionable
- Use ${language} language appropriately
- Match the ${ageGroup} demographic
- Focus on the most important insight only
- Make it feel like you truly understand their financial situation
- Be encouraging but honest about their situation

${language === 'Roman Urdu' ? 'Use Roman Urdu (English alphabet with Urdu words).' : ''}
${language === 'Hindi' ? 'Use Hindi script.' : ''}
${language === 'Bengali' ? 'Use Bengali script.' : ''}

Return ONLY JSON: {"title": "...", "body": "..."}`;
}

async function callDeepSeekAPI(prompt: string, apiKey: string): Promise<{title: string, body: string}> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-app-url.com',
      'X-Title': 'Intelligent Financial Notifications'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-v2-chat',
      messages: [
        {
          role: 'system',
          content: 'You are DeepSeek, an advanced AI financial advisor that creates highly personalized, insightful notifications. You have deep understanding of personal finance and human psychology. Always respond with valid JSON format containing title and body fields.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse DeepSeek response:', content);
    return {
      title: 'Financial Update',
      body: 'Check your spending and budget status for important insights.'
    };
  }
}

function getLanguageFromCurrency(currency: string): string {
  switch (currency) {
    case 'PKR': return 'Roman Urdu';
    case 'INR': return 'Hindi';
    case 'BDT': return 'Bengali';
    default: return 'English';
  }
}

function getAgeGroup(age: number): string {
  if (age < 25) return 'young professional';
  if (age < 35) return 'adult';
  if (age < 50) return 'middle-aged professional';
  return 'mature adult';
}
