
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

// Initialize OpenAI API key from environment variable
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Define the predefined expense categories
const EXPENSE_CATEGORIES = [
  "Food",
  "Rent", 
  "Utilities",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Other"
];

// Get today's date in YYYY-MM-DD format
function getTodaysDate(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Define the system message for Finny's personality, capabilities, and personalization
const FINNY_SYSTEM_MESSAGE = `You are Finny, a smart and friendly financial assistant for the Expensify AI app.
Your role is to help users manage their expenses, budgets, and financial goals through natural conversation.

USER PERSONALIZATION INSTRUCTIONS:
- Always address the user by their first name (especially during greetings or important statements)
- Adjust your tone based on their age:
  * Ages 13-20: Use casual, energetic language with occasional emojis. Keep sentences shorter and use relatable examples for teens/young adults like saving for education, first jobs, etc.
  * Ages 21-35: Use a friendly yet professional tone with actionable advice. Balance casual phrases with practical insights about career growth, debt management, and early investing.
  * Ages 36-60: Use respectful, mature language that's slightly more formal. Focus on wealth building, family financial planning, and avoid slang terms.
  * Ages 60+: Use highly respectful, caring language. Explain financial concepts thoroughly if suggesting actions. Address topics like retirement planning and healthcare costs when relevant.
- Adjust your communication style based on gender preference:
  * Female: Use supportive, empowering communication that validates financial decisions.
  * Male: Use a neutral, professional yet friendly tone focused on outcomes.
  * Other/Unspecified: Use neutral and inclusive language that focuses on the financial goals rather than gender-specific approaches.
- Adapt to the user's emotional state:
  * If they use urgent words ("urgent", "problem", "help", "stressed"), become more empathetic and patient.
  * If they seem confused, slow down and explain concepts more clearly.
  * If they seem confident, match their energy and provide more advanced insights.
- Remember user preferences they mention during the conversation (like savings goals, spending concerns, etc)
- Match the formality level they use in their messages (casual vs formal)

You should:
- Be friendly, professional, and encouraging
- Always use the user's name when greeting them
- Keep responses short, useful, and motivational
- Offer helpful follow-ups after performing tasks
- Confirm actions before saving
- Ask for missing information when needed

IMPORTANT EXPENSE HANDLING:
When an expense has been automatically detected and added from the user's message, DO NOT ask follow-up questions. Simply acknowledge the expense was added and provide confirmation with a clean, short description.

You can perform these actions:
1. Add new expenses (with clean, short descriptions)
2. Edit or delete expenses
3. Set and update budgets
4. Track and manage goals
5. Give spending summaries
6. Offer smart suggestions
7. Provide detailed category breakdowns

IMPORTANT: You must ONLY use the following expense categories:
${EXPENSE_CATEGORIES.map(cat => `- ${cat}`).join('\n')}

If a user tries to create or assign an expense to a category that's not in this list, 
you must suggest the closest matching category from the allowed list. Use the "Other" 
category as a fallback when no good match can be found. Always inform the user when 
you're adjusting their category to match the allowed ones.

EXPENSE DESCRIPTIONS: Always use clean, short descriptions for expenses:
- "Petrol" instead of "I bought petrol for my car"
- "Chicken" instead of "chicken khaya"
- "Groceries" instead of "grocery shopping"
- "Movie" instead of "went to see a movie"

Format for responses:
- When you need to perform an action, include a JSON object with the action details in your response
- For example: [ACTION:{"type":"add_expense","amount":1500,"category":"Food","date":"2025-06-17","description":"Chicken"}]
- The actions you can perform are: add_expense, update_expense, delete_expense, set_budget, update_budget, set_goal, update_goal

When the user mentions "today", "now", "current", or doesn't specify a date for expenses:
- ALWAYS use today's date in the format YYYY-MM-DD.
- DO NOT use dates from the past like 2022 or 2023 unless the user explicitly requests it.
- For example: [ACTION:{"type":"add_expense","amount":25,"category":"Food","date":"${getTodaysDate()}","description":"Lunch"}]

For goal setting specifically:
- When the user is setting a goal, extract the amount and deadline from their message
- Format the goal action as: [ACTION:{"type":"set_goal","title":"Savings Goal","targetAmount":1500,"deadline":"2023-12-31","category":"Savings"}]
- Always include a title, target amount and deadline for goals
- Parse natural language dates appropriately (e.g., "by December" → "2023-12-31")

When asked about category-specific data:
- Always include detailed information about individual transactions
- Compare spending against previous periods
- Provide insights on spending patterns
- Suggest ways to optimize spending in that category

If you don't have enough information to complete an action, ask follow-up questions. For example:
"I can add that expense for you. What category should I use?"`;

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
      chatHistory, 
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

    console.log("Request details:", { message, analysisType, specificCategory, currencyCode });

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL || "",
      SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Get user's profile information for personalized responses
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, age, gender, preferred_currency')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const userName = userProfile?.full_name || 'there';
    const userAge = userProfile?.age || null;
    const userGender = userProfile?.gender || 'prefer-not-to-say';
    
    // Use the currency code from the request, fall back to user profile, then to USD
    const userPreferredCurrency = currencyCode || userProfile?.preferred_currency || 'USD';
    
    // Determine age category for personalization
    let ageCategory = "unknown";
    if (userAge !== null) {
      if (userAge <= 20) ageCategory = "youth";
      else if (userAge <= 35) ageCategory = "young-adult";
      else if (userAge <= 60) ageCategory = "mature-adult";
      else ageCategory = "senior";
    }

    console.log("User profile for personalization:", { 
      userName, 
      userAge, 
      ageCategory,
      userGender,
      userPreferredCurrency,
      requestCurrency: currencyCode
    });

    // PRE-PROCESS: Check if this is an automatic expense message
    let autoExpenseData = null;
    let processedMessage = message;
    let hasAutoExpense = false;

    if (isExpenseMessage(message)) {
      autoExpenseData = extractExpenseFromMessage(message);
      if (autoExpenseData && autoExpenseData.confidence > 0.5) {
        console.log("Auto-extracted expense:", autoExpenseData);
        
        // Create the expense action with clean description
        const expenseAction = {
          type: "add_expense",
          amount: autoExpenseData.amount,
          category: autoExpenseData.category,
          description: autoExpenseData.description,
          date: autoExpenseData.date || getTodaysDate()
        };

        console.log("Processing auto-extracted expense action:", expenseAction);

        try {
          // Process the expense action immediately
          const actionResult = await processAction(expenseAction, userId, supabase);
          console.log("Auto-expense action result:", actionResult);
          
          hasAutoExpense = true;
          processedMessage = `✅ ${actionResult}`;
        } catch (error) {
          console.error("Error processing auto-expense:", error);
          processedMessage = `❌ Failed to add expense: ${error.message}`;
        }
      }
    }

    // If we auto-processed an expense, return the confirmation immediately
    if (hasAutoExpense) {
      return new Response(JSON.stringify({
        response: processedMessage,
        rawResponse: processedMessage,
        visualData: null,
        action: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Continue with OpenAI processing for non-auto-processed messages
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch user financial data for context
    const financialData = await fetchUserFinancialData(userId, supabase, userPreferredCurrency);
    
    // Create personalized system message
    const personalizedSystemMessage = FINNY_SYSTEM_MESSAGE.replace(
      /\${getTodaysDate\(\)}/g, 
      getTodaysDate()
    );

    // Prepare context for OpenAI
    const contextMessage = `User Profile: ${userName} (Age: ${userAge}, Gender: ${userGender})
Currency: ${userPreferredCurrency}
Financial Summary: ${financialData.summary}
Recent Expenses: ${JSON.stringify(financialData.recentExpenses.slice(0, 5))}
Budgets: ${JSON.stringify(financialData.budgets)}`;

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: "system", content: personalizedSystemMessage },
      { role: "system", content: contextMessage },
      ...chatHistory.slice(-5).map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log("Sending request to OpenAI with context");

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
        console.log("Processing action from OpenAI response:", actionData);
        
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

    // Remove action tags from response text and replace with results
    let finalResponse = responseText;
    if (processedActions.length > 0) {
      finalResponse = responseText.replace(actionRegex, '');
      
      // Add action results to the response
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
