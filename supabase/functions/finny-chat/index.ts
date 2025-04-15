
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { processAction } from "./services/actionProcessor.ts";
import { fetchUserFinancialData } from "./services/userDataService.ts";
import { formatCurrency } from "./utils/formatters.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize OpenAI API key from environment variable
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Define the system message for Finny's personality and capabilities
const FINNY_SYSTEM_MESSAGE = `You are Finny, a smart and friendly financial assistant for the Expensify AI app.
Your role is to help users manage their expenses, budgets, and financial goals through natural conversation.

You should:
- Be friendly, professional, and encouraging
- Always use the user's name when greeting them
- Keep responses short, useful, and motivational
- Offer helpful follow-ups after performing tasks
- Confirm actions before saving
- Ask for missing information when needed

You can perform these actions:
1. Add new expenses
2. Edit or delete expenses
3. Set and update budgets
4. Track and manage goals
5. Give spending summaries
6. Offer smart suggestions

Format for responses:
- When you need to perform an action, include a JSON object with the action details in your response
- For example: [ACTION:{"type":"add_expense","amount":1500,"category":"Groceries","date":"2023-04-10","description":"Grocery shopping"}]
- The actions you can perform are: add_expense, update_expense, delete_expense, set_budget, update_budget, set_goal, update_goal

If you don't have enough information to complete an action, ask follow-up questions. For example:
"I can add that expense for you. What category should I use?"`;

// Handle HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, chatHistory } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL || "",
      SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Get user's profile information for personalized responses
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const userName = userProfile?.full_name || 'there';

    // Get user's financial data to provide context
    let userContext = "";
    try {
      const { data: budgets } = await supabase
        .from('budgets')
        .select('monthly_income')
        .eq('user_id', userId)
        .limit(1);

      const monthlyIncome = budgets?.[0]?.monthly_income || 0;
      
      const userData = await fetchUserFinancialData(supabase, userId, monthlyIncome);
      
      // Format context for the AI
      userContext = `
Hi ${userName}! Here's your financial context:

Monthly Overview:
- Income: ${formatCurrency(monthlyIncome)}
- Total spending this month: ${formatCurrency(userData.monthlyTotal)}
- Total spending last month: ${formatCurrency(userData.prevMonthTotal)}
${userData.savingsRate !== null ? `- Current savings rate: ${userData.savingsRate.toFixed(1)}%` : ''}
- Monthly change: ${userData.monthlyTotal > userData.prevMonthTotal ? 'Increased by ' : 'Decreased by '}${formatCurrency(Math.abs(userData.monthlyTotal - userData.prevMonthTotal))} (${((Math.abs(userData.monthlyTotal - userData.prevMonthTotal) / (userData.prevMonthTotal || 1)) * 100).toFixed(1)}%)

Spending Categories (This Month):
${Object.entries(userData.categorySpending)
  .sort((a, b) => b[1] - a[1])
  .map(([category, amount]) => `  * ${category}: ${formatCurrency(Number(amount))}`)
  .join('\n')}

Previous Month Categories:
${Object.entries(userData.prevCategorySpending)
  .sort((a, b) => b[1] - a[1])
  .map(([category, amount]) => `  * ${category}: ${formatCurrency(Number(amount))}`)
  .join('\n')}

Recent Activity:
- Latest Expenses: ${userData.recentExpenses ? userData.recentExpenses.slice(0, 5).map(exp => `${exp.category} (${formatCurrency(exp.amount)})`).join(', ') : "No recent expenses"}
- Active Budgets: ${userData.budgets ? userData.budgets.map(b => `${b.category} (${formatCurrency(b.amount)})`).join(', ') : "No budgets set"}

All expense categories used: ${userData.uniqueCategories.join(', ')}

When responding to the user:
1. Use their name (${userName}) occasionally to make interactions personal
2. Include relevant financial data in your responses
3. Offer specific suggestions based on their spending patterns
4. Highlight both positive trends and areas for improvement`;

    } catch (error) {
      console.error("Error fetching user context:", error);
      userContext = "Unable to retrieve user's financial context completely.";
    }

    // Format chat history for OpenAI
    const formattedHistory = chatHistory?.map((msg: any) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: FINNY_SYSTEM_MESSAGE + "\n\n" + userContext },
          ...formattedHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;

    // Check if the response contains an action to perform
    const actionMatch = aiResponse.match(/\[ACTION:(.*?)\]/);
    let processedResponse = aiResponse;
    
    if (actionMatch && actionMatch[1]) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        
        // Process the action based on its type
        const actionResult = await processAction(actionData, userId, supabase);
        
        // Replace the action marker with a confirmation
        processedResponse = aiResponse.replace(
          actionMatch[0], 
          `✅ ${actionResult}`
        );
        
      } catch (actionError) {
        console.error('Error processing action:', actionError);
        // Replace the action marker with an error message
        processedResponse = aiResponse.replace(
          actionMatch[0], 
          `❌ Sorry, I couldn't complete that action. ${actionError.message}`
        );
      }
    }

    // Return the AI response
    return new Response(
      JSON.stringify({ 
        response: processedResponse,
        rawResponse: aiResponse
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
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

