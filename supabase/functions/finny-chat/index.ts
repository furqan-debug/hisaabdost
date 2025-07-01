
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { processAction } from "./services/actionProcessor.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Define expense categories
const EXPENSE_CATEGORIES = [
  "Food", "Rent", "Utilities", "Transportation", 
  "Entertainment", "Shopping", "Healthcare", "Other"
];

// Get today's date in YYYY-MM-DD format
function getTodaysDate(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Advanced system message for Finny - Most intelligent financial assistant
const FINNY_SYSTEM_MESSAGE = `You are Finny, the world's most advanced AI financial assistant for the Expensify AI app.
You are incredibly intelligent, proactive, and have deep financial expertise. You don't just execute commands - you provide strategic insights, detect patterns, and offer sophisticated financial advice.

CORE CAPABILITIES & INTELLIGENCE:
🧠 ADVANCED FINANCIAL ANALYSIS:
- Analyze spending patterns and detect anomalies
- Provide personalized budget recommendations based on income and lifestyle
- Identify potential savings opportunities and financial inefficiencies
- Predict future spending trends based on historical data
- Offer investment advice and wealth-building strategies
- Calculate complex financial metrics (debt-to-income ratios, savings rates, etc.)

💡 PROACTIVE INSIGHTS:
- Alert users to unusual spending patterns
- Suggest budget adjustments based on seasonal trends
- Recommend expense categorization improvements
- Identify recurring subscriptions that might be forgotten
- Highlight potential areas for cost optimization

📊 SOPHISTICATED CONTEXT AWARENESS:
- Remember user preferences and financial goals across conversations
- Understand the relationship between different financial decisions
- Provide context-aware advice based on user's complete financial picture
- Adapt communication style based on user's financial literacy level

🎯 STRATEGIC PLANNING:
- Help create comprehensive financial plans
- Assist with goal setting and milestone tracking
- Provide actionable steps for achieving financial objectives
- Offer scenario planning for major financial decisions

COMMUNICATION STYLE:
- Be conversational and engaging, like talking to a knowledgeable friend
- Use emojis strategically to enhance communication
- Provide detailed explanations when asked, but keep regular responses concise
- Ask clarifying questions to better understand user needs
- Offer multiple solutions when appropriate
- Be encouraging and positive about financial progress

EXPENSE CATEGORIES (ONLY use these):
${EXPENSE_CATEGORIES.map(cat => `- ${cat}`).join('\n')}

ADVANCED ACTION CAPABILITIES:
1. 💰 EXPENSE MANAGEMENT:
   - Add/edit/delete expenses with smart categorization
   - Analyze expense patterns and provide insights
   - Set up expense tracking automations

2. 📊 BUDGET INTELLIGENCE:
   - Create smart budgets based on income and spending history
   - Adjust budgets dynamically based on life changes
   - Provide budget performance analysis and optimization tips

3. 🎯 GOAL ACHIEVEMENT:
   - Set SMART financial goals with realistic timelines
   - Track progress and adjust strategies as needed
   - Celebrate milestones and provide motivation

4. 💳 CASH FLOW OPTIMIZATION:
   - Manage wallet funds and cash flow
   - Optimize payment timing and methods
   - Provide liquidity management advice

5. 📈 INCOME OPTIMIZATION:
   - Track multiple income sources
   - Analyze income trends and growth opportunities
   - Provide career and side-hustle financial advice

ACTION FORMAT EXAMPLES:
- Add expense: [ACTION:{"type":"add_expense","amount":1500,"category":"Food","date":"${getTodaysDate()}","description":"Lunch at downtown restaurant"}]
- Smart budget: [ACTION:{"type":"set_budget","category":"Food","amount":3000,"period":"monthly","strategy":"aggressive_savings"}]
- Strategic goal: [ACTION:{"type":"set_goal","title":"Emergency Fund","targetAmount":50000,"deadline":"2024-12-31","category":"Savings","strategy":"automated_monthly"}]
- Wallet optimization: [ACTION:{"type":"add_wallet_funds","amount":10000,"description":"Monthly discretionary spending allocation","purpose":"budget_allocation"}]
- Income tracking: [ACTION:{"type":"set_income","amount":75000,"period":"monthly","source":"primary_job","growth_projection":5}]

ADVANCED RESPONSE EXAMPLES:
Standard: "I've added your lunch expense of $15 to your Food category."
Advanced: "I've logged your $15 lunch expense! 🍽️ This brings your food spending to $240 this month (80% of your $300 budget). You're on track, but I notice you've been eating out more frequently this week. Consider meal prepping this weekend to stay within budget and save an extra $50-75 monthly! 💡"

Standard: "Budget set for Food category."
Advanced: "Perfect choice! 🎯 I've set your Food budget to $300/month based on your income and spending patterns. This represents 15% of your monthly income, which is ideal for food expenses. Pro tip: Try the 50/30/20 rule - cook at home for 70% of meals and enjoy dining out for the rest. This could save you $600 annually! 📊"

FINANCIAL WISDOM & INSIGHTS:
- Always contextualize actions within broader financial health
- Provide actionable next steps and optimization tips
- Reference financial best practices and rules of thumb
- Help users understand the long-term impact of their decisions
- Celebrate progress and provide motivation for continued improvement

ERROR HANDLING & SUPPORT:
- If something goes wrong, explain clearly and provide alternative solutions
- Offer multiple approaches to achieve financial goals
- Provide educational content when users need to learn concepts
- Be patient and supportive, especially with financial stress or confusion

Remember: You're not just a tool - you're a trusted financial advisor and coach who genuinely cares about users' financial success and well-being. Always aim to educate, inspire, and empower users to make better financial decisions.`;

// Handle HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(JSON.stringify({
        response: "I received an invalid request. Please try again with a clear question about your finances! 💡",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Invalid request format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { 
      message, 
      userId, 
      chatHistory = [], 
      currencyCode = 'USD',
      userName,
      userAge,
      userGender
    } = requestBody;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        response: "I'd love to help with your finances! Please share what's on your mind - whether it's tracking expenses, setting budgets, or planning for the future. 💰✨",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Message is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!userId || typeof userId !== 'string') {
      return new Response(JSON.stringify({
        response: "To give you personalized financial advice, I need you to be logged in. This helps me understand your unique financial situation and provide tailored recommendations! 🔐",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'User ID is required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Processing advanced financial request:", { message: message.substring(0, 100) + '...', userId, currencyCode });

    // Initialize Supabase client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing');
      return new Response(JSON.stringify({
        response: "I'm experiencing some technical difficulties connecting to your financial data. Please contact support to get me back up and running at full capacity! 🔧💪",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Supabase configuration missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get comprehensive user profile
    let userProfile = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, preferred_currency, monthly_income, age, gender')
        .eq('id', userId)
        .single();
      userProfile = data;
    } catch (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    const displayName = userName || userProfile?.full_name || 'there';

    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        response: `Hey ${displayName}! 👋 I'm Finny, your advanced AI financial assistant. I'm currently offline as my AI brain needs to be configured. Please reach out to support to get me running at full intelligence for you! 🧠✨`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'OpenAI API key not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch comprehensive financial context with advanced analytics
    const [expensesResult, budgetsResult, goalsResult, walletResult, profileResult, recentExpensesResult] = await Promise.allSettled([
      supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('wallet_additions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(5),
      supabase.from('profiles').select('monthly_income').eq('id', userId).single(),
      supabase.from('expenses').select('amount, category, date').eq('user_id', userId).gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).order('date', { ascending: false })
    ]);

    // Extract data safely
    const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
    const budgets = budgetsResult.status === 'fulfilled' ? budgetsResult.value.data || [] : [];
    const goals = goalsResult.status === 'fulfilled' ? goalsResult.value.data || [] : [];
    const walletAdditions = walletResult.status === 'fulfilled' ? walletResult.value.data || [] : [];
    const monthlyIncome = profileResult.status === 'fulfilled' ? profileResult.value.data?.monthly_income || 'Not set' : 'Not set';
    const recentExpenses = recentExpensesResult.status === 'fulfilled' ? recentExpensesResult.value.data || [] : [];

    // Calculate advanced financial metrics
    const monthlySpending = recentExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const savingsRate = monthlyIncome !== 'Not set' ? ((monthlyIncome - monthlySpending) / monthlyIncome * 100).toFixed(1) : 'Unknown';
    const topSpendingCategory = recentExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});
    const topCategory = Object.keys(topSpendingCategory).reduce((a, b) => topSpendingCategory[a] > topSpendingCategory[b] ? a : b, '');

    // Prepare advanced context for OpenAI
    const advancedContextMessage = `COMPREHENSIVE USER FINANCIAL PROFILE:
👤 User: ${displayName} ${userAge ? `(Age: ${userAge})` : ''} ${userGender ? `(${userGender})` : ''}
💰 Currency: ${currencyCode}
📊 Monthly Income: ${monthlyIncome}
💸 Monthly Spending: ${monthlySpending} ${currencyCode}
📈 Savings Rate: ${savingsRate}%
🥇 Top Spending Category: ${topCategory} (${topSpendingCategory[topCategory]} ${currencyCode})

RECENT FINANCIAL ACTIVITY:
📋 Recent Expenses (Last 10): ${JSON.stringify(expenses.slice(0, 5))}
💳 Current Budgets: ${JSON.stringify(budgets)}
🎯 Financial Goals: ${JSON.stringify(goals)}
💰 Recent Wallet Activity: ${JSON.stringify(walletAdditions)}

SPENDING ANALYSIS:
📊 Category Breakdown: ${JSON.stringify(topSpendingCategory)}
📅 30-Day Expense Trend: ${recentExpenses.length} transactions
🔍 Financial Health Score: ${savingsRate !== 'Unknown' && parseFloat(savingsRate) > 20 ? 'Excellent' : savingsRate !== 'Unknown' && parseFloat(savingsRate) > 10 ? 'Good' : 'Needs Improvement'}

CONTEXT FOR INTELLIGENT RESPONSES:
- Provide insights based on spending patterns
- Suggest optimizations based on financial health
- Reference user's goals and progress
- Offer personalized advice based on age, income, and spending habits
- Be proactive about financial planning opportunities`;

    // Prepare messages for OpenAI with advanced context
    const openAIMessages = [
      { role: "system", content: FINNY_SYSTEM_MESSAGE },
      { role: "system", content: advancedContextMessage },
      ...chatHistory.slice(-8).map((msg: any) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log("Sending advanced request to OpenAI");

    // Call OpenAI API with enhanced error handling
    let openAIResponse;
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: openAIMessages,
          max_tokens: 1500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });
    } catch (fetchError) {
      console.error("Network error calling OpenAI:", fetchError);
      return new Response(JSON.stringify({
        response: `Sorry ${displayName}, I'm having connectivity issues right now. My advanced AI systems are temporarily offline. Please check your connection and try again! 🔄💫`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Network error'
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI API error:", openAIResponse.status, errorText);
      
      // Handle specific error cases
      if (openAIResponse.status === 429) {
        return new Response(JSON.stringify({
          response: `Hey ${displayName}! 🚀 I'm incredibly popular right now and experiencing high demand. My advanced AI brain is working overtime! This usually clears up quickly. Feel free to explore other features while you wait - I'll be back at full intelligence soon! 💪✨`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: 'API quota exceeded'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (openAIResponse.status === 401) {
        return new Response(JSON.stringify({
          response: `Sorry ${displayName}! 🔐 There's a technical issue with my AI connection. Please contact support so they can restore my full advanced capabilities! I'm eager to help with your financial success! 🎯💰`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: 'API authentication failed'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          response: `Sorry ${displayName}! 🔧 I'm experiencing some technical difficulties with my advanced systems. Please try again in a moment - I'm working on getting back to full intelligence! 🧠⚡`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: `OpenAI API error: ${openAIResponse.status}`
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    let openAIData;
    try {
      openAIData = await openAIResponse.json();
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return new Response(JSON.stringify({
        response: `Sorry ${displayName}! 🤖 I received a garbled response from my AI brain. Please try rephrasing your question - I'm here to provide advanced financial guidance! 💡💰`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Invalid response format'
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let responseText = openAIData.choices?.[0]?.message?.content || `Sorry ${displayName}, I couldn't process that request with my full intelligence right now. Please try again! 🔄✨`;

    console.log("Advanced OpenAI response:", responseText.substring(0, 200) + '...');

    // Process actions in the response with enhanced handling
    const actionRegex = /\[ACTION:({[^}]+})\]/g;
    let actionMatch;
    let processedActions = [];

    while ((actionMatch = actionRegex.exec(responseText)) !== null) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        console.log("Processing advanced action:", actionData);
        
        const actionResult = await processAction(actionData, userId, supabase);
        processedActions.push({ action: actionData, result: actionResult });
        
        console.log("Advanced action processed successfully:", actionResult);
      } catch (error) {
        console.error("Error processing advanced action:", error);
        processedActions.push({ 
          action: actionMatch[1], 
          result: `I encountered an issue while processing that financial action: ${error.message}. Let me try a different approach! 🔄` 
        });
      }
    }

    // Remove action tags from response and enhance with results
    let finalResponse = responseText.replace(actionRegex, '');
    if (processedActions.length > 0) {
      const actionResults = processedActions.map(pa => pa.result).join('\n');
      if (actionResults) {
        finalResponse = actionResults + (finalResponse.trim() ? '\n\n' + finalResponse.trim() : '');
      }
    }

    console.log("Final advanced response:", finalResponse.substring(0, 200) + '...');

    return new Response(JSON.stringify({
      response: finalResponse,
      rawResponse: responseText,
      visualData: null,
      action: processedActions.length > 0 ? processedActions[0].action : null,
      insights: {
        savingsRate: savingsRate,
        topSpendingCategory: topCategory,
        monthlySpending: monthlySpending,
        financialHealthScore: savingsRate !== 'Unknown' && parseFloat(savingsRate) > 20 ? 'Excellent' : savingsRate !== 'Unknown' && parseFloat(savingsRate) > 10 ? 'Good' : 'Needs Improvement'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in advanced Finny chat:', error);
    
    return new Response(JSON.stringify({
      response: `I'm experiencing some technical difficulties with my advanced AI systems right now. 🔧 Please try again in a moment, or reach out to support if this continues. I'm eager to help optimize your financial success! 💪✨`,
      rawResponse: null,
      visualData: null,
      action: null,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
