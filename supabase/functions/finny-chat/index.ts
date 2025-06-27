
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

// Enhanced system message for Finny
const FINNY_SYSTEM_MESSAGE = `You are Finny, a smart and friendly financial assistant for the Expensify AI app.
Your role is to help users manage their expenses, budgets, goals, income, and wallet funds through natural conversation.

COMMUNICATION STYLE:
- Write in a conversational, friendly tone like you're talking to a friend
- Use natural sentence flow without bullet points or asterisks
- Keep responses concise but warm and helpful
- Use emojis sparingly and only when they add genuine value
- Avoid robotic formatting like "Here's what I did:" or "Summary:"
- Instead of listing actions, weave them naturally into your response

You can perform these actions:
1. Add/edit/delete expenses
2. Set/update/delete budgets for categories
3. Create/update/delete financial goals
4. Add funds to wallet
5. Set/update monthly income
6. Provide spending summaries and analysis

IMPORTANT: You must ONLY use the following expense categories:
${EXPENSE_CATEGORIES.map(cat => `- ${cat}`).join('\n')}

Action Format Examples:
- Add expense: [ACTION:{"type":"add_expense","amount":1500,"category":"Food","date":"${getTodaysDate()}","description":"Lunch"}]
- Set budget: [ACTION:{"type":"set_budget","category":"Food","amount":3000,"period":"monthly"}]
- Create goal: [ACTION:{"type":"set_goal","title":"Emergency Fund","targetAmount":50000,"deadline":"2024-12-31","category":"Savings"}]
- Add wallet funds: [ACTION:{"type":"add_wallet_funds","amount":10000,"description":"Monthly allowance"}]
- Set income: [ACTION:{"type":"set_income","amount":75000,"period":"monthly"}]
- Delete budget: [ACTION:{"type":"delete_budget","category":"Food"}]
- Delete goal: [ACTION:{"type":"delete_goal","title":"Emergency Fund"}]

When the user mentions "today" or doesn't specify a date, always use today's date: ${getTodaysDate()}

RESPONSE EXAMPLES:
Good: "I've added your lunch expense of $15 to your Food category. That brings your food spending this month to $240 so far."
Bad: "* Added expense: $15 for lunch
* Category: Food  
* Date: Today
Summary: Expense successfully recorded."

Good: "Perfect! I've set up a $300 monthly budget for your Food category. This should help you keep track of your dining expenses."
Bad: "* Budget created
* Category: Food
* Amount: $300/month
* Status: Active"

ERROR HANDLING:
- If you encounter any errors, explain them clearly and suggest solutions
- Always be helpful and provide alternatives when something doesn't work
- If an action fails, explain what went wrong and how to fix it`;

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
        response: "I received an invalid request. Please try again.",
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
      currencyCode = 'USD'
    } = requestBody;

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({
        response: "Please provide a valid message.",
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
        response: "Authentication required. Please log in to use Finny.",
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'User ID is required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Processing request:", { message: message.substring(0, 100) + '...', userId, currencyCode });

    // Initialize Supabase client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing');
      return new Response(JSON.stringify({
        response: "I'm having configuration issues right now. Please contact support to get me running properly.",
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

    // Get user profile with error handling
    let userProfile = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, preferred_currency')
        .eq('id', userId)
        .single();
      userProfile = data;
    } catch (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    const userName = userProfile?.full_name || 'there';

    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        response: `Hey ${userName}! I'm Finny, your financial assistant. I'm currently offline as my AI service needs to be set up. Please reach out to support to get me running for you.`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'OpenAI API key not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch user's financial context with error handling
    const [expensesResult, budgetsResult, goalsResult, walletResult, profileResult] = await Promise.allSettled([
      supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(5),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('wallet_additions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(3),
      supabase.from('profiles').select('monthly_income').eq('id', userId).single()
    ]);

    // Extract data safely
    const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
    const budgets = budgetsResult.status === 'fulfilled' ? budgetsResult.value.data || [] : [];
    const goals = goalsResult.status === 'fulfilled' ? goalsResult.value.data || [] : [];
    const walletAdditions = walletResult.status === 'fulfilled' ? walletResult.value.data || [] : [];
    const monthlyIncome = profileResult.status === 'fulfilled' ? profileResult.value.data?.monthly_income || 'Not set' : 'Not set';

    // Prepare context for OpenAI
    const contextMessage = `User Profile: ${userName}
Currency: ${currencyCode}
Monthly Income: ${monthlyIncome}
Recent Expenses: ${JSON.stringify(expenses)}
Current Budgets: ${JSON.stringify(budgets)}
Financial Goals: ${JSON.stringify(goals)}
Recent Wallet Additions: ${JSON.stringify(walletAdditions)}`;

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: "system", content: FINNY_SYSTEM_MESSAGE },
      { role: "system", content: contextMessage },
      ...chatHistory.slice(-5).map((msg: any) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log("Sending request to OpenAI");

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
          model: "gpt-4o-mini",
          messages: openAIMessages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });
    } catch (fetchError) {
      console.error("Network error calling OpenAI:", fetchError);
      return new Response(JSON.stringify({
        response: `Sorry ${userName}, I'm having network connectivity issues right now. Please check your internet connection and try again in a moment.`,
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
          response: `Hey ${userName}, I'm swamped right now due to high demand. This usually clears up in a few hours. Feel free to keep using the app's other features while you wait!`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: 'API quota exceeded'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (openAIResponse.status === 401) {
        return new Response(JSON.stringify({
          response: `Sorry ${userName}, there's a technical issue with my AI connection. Please contact support so they can get me back up and running.`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: 'API authentication failed'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          response: `Sorry ${userName}, I'm experiencing technical difficulties. Please try again in a moment or contact support if this continues.`,
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
        response: `Sorry ${userName}, I received a malformed response from my AI service. Please try again.`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'Invalid response format'
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let responseText = openAIData.choices?.[0]?.message?.content || "Sorry, I couldn't process that request right now.";

    console.log("OpenAI response:", responseText.substring(0, 200) + '...');

    // Process actions in the response
    const actionRegex = /\[ACTION:({[^}]+})\]/g;
    let actionMatch;
    let processedActions = [];

    while ((actionMatch = actionRegex.exec(responseText)) !== null) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        console.log("Processing action:", actionData);
        
        const actionResult = await processAction(actionData, userId, supabase);
        processedActions.push({ action: actionData, result: actionResult });
        
        console.log("Action processed successfully:", actionResult);
      } catch (error) {
        console.error("Error processing action:", error);
        processedActions.push({ 
          action: actionMatch[1], 
          result: `Something went wrong while processing that action: ${error.message}` 
        });
      }
    }

    // Remove action tags from response and add results
    let finalResponse = responseText.replace(actionRegex, '');
    if (processedActions.length > 0) {
      const actionResults = processedActions.map(pa => pa.result).join('\n');
      if (actionResults) {
        finalResponse = actionResults + (finalResponse.trim() ? '\n\n' + finalResponse.trim() : '');
      }
    }

    console.log("Final response:", finalResponse.substring(0, 200) + '...');

    return new Response(JSON.stringify({
      response: finalResponse,
      rawResponse: responseText,
      visualData: null,
      action: processedActions.length > 0 ? processedActions[0].action : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in Finny chat:', error);
    
    return new Response(JSON.stringify({
      response: `I'm having some technical difficulties right now. Please try again in a moment, or reach out to support if this keeps happening.`,
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
