
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

// Enhanced system message for Finny with all capabilities
const FINNY_SYSTEM_MESSAGE = `You are Finny, a smart and friendly financial assistant for the Expensify AI app.
Your role is to help users manage their expenses, budgets, goals, income, and wallet funds through natural conversation.

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

Be conversational and helpful. Always confirm what action you're taking.`;

// Handle HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      userId, 
      chatHistory = [], 
      currencyCode = 'USD'
    } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log("Processing request:", { message, userId, currencyCode });

    // Initialize Supabase client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name, preferred_currency')
      .eq('id', userId)
      .single();

    const userName = userProfile?.full_name || 'there';

    // Check if OpenAI API key is available
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        response: `Hello ${userName}! I'm Finny, your financial assistant. However, I'm currently unavailable as the OpenAI API key needs to be configured. Please contact support to enable this feature.`,
        rawResponse: null,
        visualData: null,
        action: null,
        error: 'OpenAI API key not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch user's financial context for better responses
    const [expensesResult, budgetsResult, goalsResult, walletResult, profileResult] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(5),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('wallet_additions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(3),
      supabase.from('profiles').select('monthly_income').eq('id', userId).single()
    ]);

    // Prepare context for OpenAI
    const contextMessage = `User Profile: ${userName}
Currency: ${currencyCode}
Monthly Income: ${profileResult.data?.monthly_income || 'Not set'}
Recent Expenses: ${JSON.stringify(expensesResult.data || [])}
Current Budgets: ${JSON.stringify(budgetsResult.data || [])}
Financial Goals: ${JSON.stringify(goalsResult.data || [])}
Recent Wallet Additions: ${JSON.stringify(walletResult.data || [])}`;

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

    // Call OpenAI API with better error handling
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error("OpenAI API error:", errorData);
      
      // Handle specific error cases
      if (openAIResponse.status === 429) {
        return new Response(JSON.stringify({
          response: `I'm sorry ${userName}, but I'm currently unavailable due to API limits being reached. This usually resolves within a few hours. Please try again later, or you can continue using the app's other features in the meantime.`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: 'API quota exceeded'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (openAIResponse.status === 401) {
        return new Response(JSON.stringify({
          response: `I'm sorry ${userName}, but there's an authentication issue with my AI service. Please contact support to resolve this.`,
          rawResponse: null,
          visualData: null,
          action: null,
          error: 'API authentication failed'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorData}`);
      }
    }

    const openAIData = await openAIResponse.json();
    let responseText = openAIData.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    console.log("OpenAI response:", responseText);

    // Check for actions in the response
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
          result: `❌ Failed to process action: ${error.message}` 
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

    console.log("Final response:", finalResponse);

    return new Response(JSON.stringify({
      response: finalResponse,
      rawResponse: responseText,
      visualData: null,
      action: processedActions.length > 0 ? processedActions[0].action : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in Finny chat:', error);
    
    return new Response(JSON.stringify({
      response: `❌ I'm currently experiencing technical difficulties. Please try again in a few moments, or contact support if the issue persists.`,
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
