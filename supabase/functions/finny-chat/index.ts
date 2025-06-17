
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

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

// Process actions like adding expenses
async function processAction(actionData: any, userId: string, supabase: any): Promise<string> {
  console.log("Processing action:", actionData);
  
  try {
    if (actionData.type === "add_expense") {
      // Insert expense into database
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: userId,
          description: actionData.description || "Expense",
          amount: parseFloat(actionData.amount) || 0,
          date: actionData.date || getTodaysDate(),
          category: actionData.category || "Other",
          payment: actionData.paymentMethod || "Card",
          is_recurring: false,
          notes: "Added via Finny chat"
        })
        .select('id');

      if (error) {
        console.error("Database error:", error);
        return `❌ Failed to add expense: ${error.message}`;
      }

      console.log("Expense added successfully:", data);
      return `✅ Added expense: ${actionData.description} for $${actionData.amount}`;
      
    } else if (actionData.type === "delete_expense") {
      // Delete expense by ID
      if (actionData.id) {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', actionData.id)
          .eq('user_id', userId);
          
        if (error) {
          console.error("Delete error:", error);
          return `❌ Failed to delete expense: ${error.message}`;
        }
        
        console.log("Expense deleted successfully by ID");
        return "✅ Expense deleted successfully";
      } else {
        // Delete most recent expense
        const { data: recentExpense, error: fetchError } = await supabase
          .from('expenses')
          .select('id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (fetchError || !recentExpense) {
          return "❌ No recent expense found to delete";
        }
        
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('id', recentExpense.id)
          .eq('user_id', userId);
          
        if (deleteError) {
          return `❌ Failed to delete expense: ${deleteError.message}`;
        }
        
        return "✅ Most recent expense deleted successfully";
      }
    }
    
    return `❌ Unknown action type: ${actionData.type}`;
  } catch (error) {
    console.error("Action processing error:", error);
    return `❌ Error processing action: ${error.message}`;
  }
}

// System message for Finny
const FINNY_SYSTEM_MESSAGE = `You are Finny, a smart and friendly financial assistant for the Expensify AI app.
Your role is to help users manage their expenses, budgets, and financial goals through natural conversation.

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

    // Continue with OpenAI processing if we have the API key
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        response: `Hello ${userName}! I'm Finny, your financial assistant. However, I need the OpenAI API key to be configured to help you properly.`,
        rawResponse: null,
        visualData: null,
        action: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch recent expenses for context
    const { data: recentExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    // Prepare context for OpenAI
    const contextMessage = `User Profile: ${userName}
Currency: ${currencyCode}
Recent Expenses: ${JSON.stringify(recentExpenses || [])}`;

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
