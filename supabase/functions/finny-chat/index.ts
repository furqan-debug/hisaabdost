
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { processAction } from "./services/actionProcessor.ts";
import { fetchUserFinancialData } from "./services/userDataService.ts";
import { formatCurrency } from "./utils/formatters.ts";
import { extractExpenseFromMessage, isExpenseMessage } from "./utils/expenseExtractor.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize environment variables
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
}

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

// System message for Finny
const FINNY_SYSTEM_MESSAGE = `You are Finny, a smart and friendly financial assistant for the Expensify AI app.
Your role is to help users manage their expenses, budgets, and financial goals through natural conversation.

USER PERSONALIZATION INSTRUCTIONS:
- Always address the user by their first name
- Adjust your tone based on their age and gender
- Be friendly, professional, and encouraging

You can perform these actions:
1. Add new expenses (with clean, short descriptions)
2. Edit or delete expenses
3. Set and update budgets
4. Track and manage goals
5. Give spending summaries

IMPORTANT: You must ONLY use the following expense categories:
${EXPENSE_CATEGORIES.map(cat => `- ${cat}`).join('\n')}

Format for responses:
- When you need to perform an action, include a JSON object with the action details
- For example: [ACTION:{"type":"add_expense","amount":1500,"category":"Food","date":"${getTodaysDate()}","description":"Lunch"}]

When the user mentions "today" or doesn't specify a date:
- ALWAYS use today's date: ${getTodaysDate()}`;

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
      analysisType = 'general',
      specificCategory = null,
      currencyCode = 'USD'
    } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log("Processing request:", { message, userId, currencyCode });

    // Initialize Supabase client with proper error handling
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, age, gender, preferred_currency')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const userName = userProfile?.full_name || 'there';
    const userPreferredCurrency = currencyCode || userProfile?.preferred_currency || 'USD';

    // PRE-PROCESS: Check for automatic expense messages
    if (isExpenseMessage(message)) {
      const autoExpenseData = extractExpenseFromMessage(message);
      if (autoExpenseData && autoExpenseData.confidence > 0.5) {
        console.log("Auto-extracted expense:", autoExpenseData);
        
        const expenseAction = {
          type: "add_expense",
          amount: autoExpenseData.amount,
          category: autoExpenseData.category,
          description: autoExpenseData.description,
          date: autoExpenseData.date || getTodaysDate()
        };

        try {
          const actionResult = await processAction(expenseAction, userId, supabase);
          return new Response(JSON.stringify({
            response: `✅ ${actionResult}`,
            rawResponse: actionResult,
            visualData: null,
            action: expenseAction
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Error processing auto-expense:", error);
          return new Response(JSON.stringify({
            response: `❌ Failed to add expense: ${error.message}`,
            rawResponse: null,
            visualData: null,
            action: null
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // Continue with OpenAI processing
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch user financial data
    const financialData = await fetchUserFinancialData(userId, supabase, userPreferredCurrency);
    
    // Prepare context for OpenAI
    const contextMessage = `User Profile: ${userName}
Currency: ${userPreferredCurrency}
Financial Summary: ${financialData.summary}
Recent Expenses: ${JSON.stringify(financialData.recentExpenses.slice(0, 5))}
Budgets: ${JSON.stringify(financialData.budgets)}`;

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: "system", content: FINNY_SYSTEM_MESSAGE },
      { role: "system", content: contextMessage },
      ...chatHistory.slice(-5).map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log("Sending request to OpenAI");

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: openAIMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
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
      response: `❌ Sorry, I encountered an error: ${error.message}. Please try again.`,
      rawResponse: null,
      visualData: null,
      action: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
