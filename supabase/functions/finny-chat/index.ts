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
7. Provide detailed category breakdowns

Format for responses:
- When you need to perform an action, include a JSON object with the action details in your response
- For example: [ACTION:{"type":"add_expense","amount":1500,"category":"Groceries","date":"2023-04-10","description":"Grocery shopping"}]
- The actions you can perform are: add_expense, update_expense, delete_expense, set_budget, update_budget, set_goal, update_goal

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

    console.log("Request details:", { message, analysisType, specificCategory });

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

    // Look for goal setting patterns to extract info directly
    const goalPattern = /(?:set|create)(?: a)? (?:savings |financial )?goal(?: of)? \$?(\d+(?:\.\d+)?)(?: (?:for|to reach|to save))? (?:by|at|on) ([a-zA-Z0-9\s,\/]+)/i;
    const goalMatch = message.match(goalPattern);
    
    if (goalMatch) {
      console.log("Detected goal setting request with:", {
        amount: goalMatch[1],
        deadline: goalMatch[2]
      });
    }

    // Get user's financial data to provide context
    let userContext = "";
    let visualData = null;
    try {
      const { data: budgets } = await supabase
        .from('budgets')
        .select('monthly_income')
        .eq('user_id', userId)
        .limit(1);

      const monthlyIncome = budgets?.[0]?.monthly_income || 0;
      
      const userData = await fetchUserFinancialData(supabase, userId, monthlyIncome);
      
      // If this is a category-specific request, prepare detailed analysis
      if (analysisType === 'category' && specificCategory) {
        // Convert to lowercase for case-insensitive comparison
        const categoryLower = specificCategory.toLowerCase();
        
        // Check if we have data for this category
        let categoryData = null;
        let matchedCategory = '';
        
        // Find the exact category match (case insensitive)
        for (const cat of Object.keys(userData.categoryDetails)) {
          if (cat.toLowerCase() === categoryLower) {
            categoryData = userData.categoryDetails[cat];
            matchedCategory = cat;
            break;
          }
        }
        
        // If we found data for this category
        if (categoryData && categoryData.length > 0) {
          // Calculate total for this category
          const categoryTotal = userData.categorySpending[matchedCategory];
          
          // Prepare visual data for the frontend
          visualData = {
            type: "category",
            category: matchedCategory,
            total: categoryTotal,
            transactions: categoryData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            count: categoryData.length,
          };
          
          // Generate detailed analysis
          const details = categoryData
            .slice(0, 5)  // Limit to top 5 transactions for the context
            .map(item => `- ${item.description || 'Expense'}: ${formatCurrency(item.amount)} on ${item.date}${item.notes ? ` (${item.notes})` : ''}`)
            .join('\n');
          
          // Add to context
          userContext += `\n\nDetailed ${matchedCategory} spending breakdown:
Total spent on ${matchedCategory}: ${formatCurrency(categoryTotal)}
Number of ${matchedCategory} transactions: ${categoryData.length}
Latest transactions:
${details}

When responding about ${matchedCategory}, include this detailed breakdown and insights about their spending pattern.`;
        } 
        else {
          userContext += `\n\nThe user is asking about ${specificCategory} spending, but there are no recorded expenses in this category. Suggest adding expenses with this category to track spending.`;
        }
      }
      
      // Format general context for the AI
      userContext += `
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
          { role: 'system', content: FINNY_SYSTEM_MESSAGE + "\n\n" + (userContext || '') },
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

    // Process goal setting patterns directly if the normal action fails
    let actionMatch = aiResponse.match(/\[ACTION:(.*?)\]/);
    let processedResponse = aiResponse;
    
    // If we have a goal match in the input but no action in the response, try to create a goal action
    if (goalMatch && (!actionMatch || !actionMatch[1].includes("set_goal"))) {
      try {
        console.log("Creating goal action from pattern match");
        const goalAction = {
          type: "set_goal",
          title: "Savings Goal",
          targetAmount: parseFloat(goalMatch[1]),
          deadline: goalMatch[2],
          category: "Savings"
        };
        
        // Process the goal action directly
        const actionResult = await processAction(goalAction, userId, supabase);
        
        // Replace or append the confirmation to the response
        if (aiResponse.includes("goal") || aiResponse.includes("saving")) {
          processedResponse = processedResponse.replace(
            /I can help you (set|create) (a|your) (savings|financial) goal/i,
            `✅ ${actionResult}`
          );
        } else {
          processedResponse = `${processedResponse}\n\n✅ ${actionResult}`;
        }
      } catch (actionError) {
        console.error('Error processing goal action:', actionError);
        if (processedResponse.includes("goal") || processedResponse.includes("saving")) {
          processedResponse = processedResponse.replace(
            /I can help you (set|create) (a|your) (savings|financial) goal/i,
            `❌ Sorry, I couldn't complete that action. ${actionError.message}`
          );
        } else {
          processedResponse = `${processedResponse}\n\n❌ Sorry, I couldn't complete that action. ${actionError.message}`;
        }
      }
    }
    // Check if there's an action in the AI response
    else if (actionMatch && actionMatch[1]) {
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
        rawResponse: aiResponse,
        visualData: visualData
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
