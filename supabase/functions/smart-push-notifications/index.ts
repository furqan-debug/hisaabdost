
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
}

interface ExpenseData {
  amount: number;
  category: string;
  date: string;
  description: string;
}

interface BudgetData {
  category: string;
  amount: number;
  spent: number;
}

interface SmartNotification {
  title: string;
  body: string;
  priority: number;
  type: 'budget' | 'wastage' | 'inactivity';
}

const NOTIFICATION_PRIORITIES = {
  budget: 1,
  wastage: 2,
  inactivity: 3
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

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    console.log('🔍 Starting smart notification analysis...');

    // Get all users for analysis
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, preferred_currency, age, full_name, monthly_income, last_login_at, last_notification_date');

    if (usersError) {
      throw usersError;
    }

    console.log(`📊 Analyzing ${users?.length || 0} users for smart notifications`);

    const notifications: Array<{userId: string, notification: SmartNotification}> = [];

    for (const user of users || []) {
      // Check daily limit - skip if already sent today
      const today = new Date().toISOString().split('T')[0];
      if (user.last_notification_date === today) {
        console.log(`⏭️ Skipping user ${user.id} - already notified today`);
        continue;
      }

      const userNotifications = await analyzeUserForNotifications(supabase, user, deepseekApiKey);
      
      if (userNotifications.length > 0) {
        // Sort by priority and take the highest priority notification
        const topNotification = userNotifications.sort((a, b) => a.priority - b.priority)[0];
        notifications.push({ userId: user.id, notification: topNotification });
      }
    }

    console.log(`🎯 Generated ${notifications.length} smart notifications`);

    // Send notifications
    let sentCount = 0;
    for (const { userId, notification } of notifications) {
      try {
        const { error: sendError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            userId,
            title: notification.title,
            body: notification.body,
            data: {
              type: notification.type,
              priority: notification.priority
            }
          }
        });

        if (!sendError) {
          // Update last notification date
          await supabase
            .from('profiles')
            .update({ last_notification_date: today })
            .eq('id', userId);
          
          sentCount++;
          console.log(`✅ Sent ${notification.type} notification to user ${userId}`);
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
        notifications_sent: sentCount
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

async function analyzeUserForNotifications(
  supabase: any, 
  user: UserData, 
  deepseekApiKey: string
): Promise<SmartNotification[]> {
  const notifications: SmartNotification[] = [];
  
  try {
    // Get user's recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category, date, description')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

    // Get user's budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('category, amount')
      .eq('user_id', user.id);

    // Calculate spending by category
    const categorySpending = (expenses || []).reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Check for budget alerts (50% threshold)
    if (budgets && budgets.length > 0) {
      for (const budget of budgets) {
        const spent = categorySpending[budget.category] || 0;
        const percentage = (spent / budget.amount) * 100;
        
        if (percentage >= 50 && percentage < 100) {
          const budgetNotification = await generateBudgetAlert(
            user, budget, spent, percentage, expenses || [], deepseekApiKey
          );
          if (budgetNotification) {
            notifications.push(budgetNotification);
          }
        }
      }
    }

    // Check for wastage alerts
    const wastageNotification = await checkWastagePattern(
      user, expenses || [], deepseekApiKey
    );
    if (wastageNotification) {
      notifications.push(wastageNotification);
    }

    // Check for inactivity alerts (48+ hours)
    if (user.last_login_at) {
      const lastLogin = new Date(user.last_login_at);
      const hoursSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLogin >= 48) {
        const inactivityNotification = await generateInactivityAlert(user, deepseekApiKey);
        if (inactivityNotification) {
          notifications.push(inactivityNotification);
        }
      }
    }

  } catch (error) {
    console.error(`Error analyzing user ${user.id}:`, error);
  }

  return notifications;
}

async function generateBudgetAlert(
  user: UserData,
  budget: any,
  spent: number,
  percentage: number,
  expenses: ExpenseData[],
  deepseekApiKey: string
): Promise<SmartNotification | null> {
  try {
    const categoryExpenses = expenses.filter(e => e.category === budget.category);
    const breakdown = categoryExpenses.reduce((acc, expense) => {
      acc[expense.description] = (acc[expense.description] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const language = getLanguageFromCurrency(user.preferred_currency);
    const ageGroup = getAgeGroup(user.age);

    const prompt = `Create a budget alert notification for a ${ageGroup} user in ${language}. 
    User: ${user.full_name || 'User'}
    Currency: ${user.preferred_currency}
    Category: ${budget.category}
    Budget: ${budget.amount}
    Spent: ${spent} (${percentage.toFixed(1)}%)
    Top expenses: ${Object.entries(breakdown).slice(0, 3).map(([desc, amt]) => `${desc}: ${amt}`).join(', ')}
    
    Generate a friendly, age-appropriate notification with title and body. Be concise and helpful.
    ${language === 'Roman Urdu' ? 'Use Roman Urdu (English alphabet with Urdu words).' : ''}
    ${language === 'Hindi' ? 'Use Hindi script.' : ''}
    ${language === 'Bengali' ? 'Use Bengali script.' : ''}
    
    Return only JSON: {"title": "...", "body": "..."}`;

    const response = await callDeepSeekAPI(prompt, deepseekApiKey);
    
    return {
      ...response,
      priority: NOTIFICATION_PRIORITIES.budget,
      type: 'budget' as const
    };
  } catch (error) {
    console.error('Error generating budget alert:', error);
    return null;
  }
}

async function checkWastagePattern(
  user: UserData,
  expenses: ExpenseData[],
  deepseekApiKey: string
): Promise<SmartNotification | null> {
  try {
    // Look for potential wasteful spending patterns
    const wastefulCategories = ['Entertainment', 'Food', 'Shopping'];
    const suspiciousKeywords = ['cigarette', 'smoke', 'cola', 'soda', 'candy', 'chips', 'junk'];
    
    const potentialWaste = expenses.filter(expense => 
      wastefulCategories.includes(expense.category) ||
      suspiciousKeywords.some(keyword => 
        expense.description.toLowerCase().includes(keyword)
      )
    );

    if (potentialWaste.length < 3) return null; // Need at least 3 instances

    const wasteAmount = potentialWaste.reduce((sum, expense) => sum + expense.amount, 0);
    const language = getLanguageFromCurrency(user.preferred_currency);
    const ageGroup = getAgeGroup(user.age);

    const prompt = `Analyze wasteful spending for a ${ageGroup} user in ${language}.
    User: ${user.full_name || 'User'}
    Currency: ${user.preferred_currency}
    Wasteful expenses: ${potentialWaste.map(e => `${e.description}: ${e.amount}`).slice(0, 5).join(', ')}
    Total waste: ${wasteAmount}
    
    Generate a helpful notification suggesting alternatives and potential savings. Be encouraging, not judgmental.
    ${language === 'Roman Urdu' ? 'Use Roman Urdu (English alphabet with Urdu words).' : ''}
    ${language === 'Hindi' ? 'Use Hindi script.' : ''}
    ${language === 'Bengali' ? 'Use Bengali script.' : ''}
    
    Return only JSON: {"title": "...", "body": "..."}`;

    const response = await callDeepSeekAPI(prompt, deepseekApiKey);
    
    return {
      ...response,
      priority: NOTIFICATION_PRIORITIES.wastage,
      type: 'wastage' as const
    };
  } catch (error) {
    console.error('Error checking wastage pattern:', error);
    return null;
  }
}

async function generateInactivityAlert(
  user: UserData,
  deepseekApiKey: string
): Promise<SmartNotification | null> {
  try {
    const language = getLanguageFromCurrency(user.preferred_currency);
    const ageGroup = getAgeGroup(user.age);

    const prompt = `Create an inactivity reminder for a ${ageGroup} user in ${language}.
    User: ${user.full_name || 'User'}
    Currency: ${user.preferred_currency}
    
    Generate a friendly reminder to check their expenses. Be encouraging and helpful.
    ${language === 'Roman Urdu' ? 'Use Roman Urdu (English alphabet with Urdu words).' : ''}
    ${language === 'Hindi' ? 'Use Hindi script.' : ''}
    ${language === 'Bengali' ? 'Use Bengali script.' : ''}
    
    Return only JSON: {"title": "...", "body": "..."}`;

    const response = await callDeepSeekAPI(prompt, deepseekApiKey);
    
    return {
      ...response,
      priority: NOTIFICATION_PRIORITIES.inactivity,
      type: 'inactivity' as const
    };
  } catch (error) {
    console.error('Error generating inactivity alert:', error);
    return null;
  }
}

async function callDeepSeekAPI(prompt: string, apiKey: string): Promise<{title: string, body: string}> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful financial assistant that creates personalized notifications. Always respond with valid JSON format containing title and body fields.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse DeepSeek response:', content);
    // Fallback response
    return {
      title: 'Spending Alert',
      body: 'Check your recent expenses and budget status.'
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
  if (age < 25) return 'young';
  if (age < 35) return 'adult';
  if (age < 50) return 'middle-aged';
  return 'mature';
}
