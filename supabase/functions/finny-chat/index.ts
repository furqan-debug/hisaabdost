
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

// Define the predefined expense categories
const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Other"
];

/**
 * IMPORTANT: If the user doesn't specify a date when adding an expense, 
 * automatically set the date to today's date in YYYY-MM-DD format.
 * 
 * Format for responses:
 * - When you need to perform an action, include a JSON object with the action details
 */

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

You can perform these actions:
1. Add new expenses
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

Format for responses:
- When you need to perform an action, include a JSON object with the action details in your response
- For example: [ACTION:{"type":"add_expense","amount":1500,"category":"Food","date":"2025-05-02","description":"Grocery shopping"}]
- The actions you can perform are: add_expense, update_expense, delete_expense, set_budget, update_budget, set_goal, update_goal

When the user mentions "today", "now", "current", or doesn't specify a date for expenses:
- ALWAYS use today's date in the format YYYY-MM-DD.
- DO NOT use dates from the past like 2022 or 2023 unless the user explicitly requests it.
- For example: [ACTION:{"type":"add_expense","amount":25,"category":"Food","date":"2025-05-02","description":"Lunch"}]

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

// Get today's date in YYYY-MM-DD format
function getTodaysDate(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

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
      .select('full_name, age, gender, preferred_currency')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const userName = userProfile?.full_name || 'there';
    const userAge = userProfile?.age || null;
    const userGender = userProfile?.gender || 'prefer-not-to-say';
    const userPreferredCurrency = userProfile?.preferred_currency || currencyCode;
    
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
      userPreferredCurrency
    });
      
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
            .map(item => `- ${item.description || 'Expense'}: ${formatCurrency(item.amount, userPreferredCurrency)} on ${item.date}${item.notes ? ` (${item.notes})` : ''}`)
            .join('\n');
          
          // Add to context
          userContext += `\n\nDetailed ${matchedCategory} spending breakdown:
Total spent on ${matchedCategory}: ${formatCurrency(categoryTotal, userPreferredCurrency)}
Number of ${matchedCategory} transactions: ${categoryData.length}
Latest transactions:
${details}

When responding about ${matchedCategory}, include this detailed breakdown and insights about their spending pattern.`;
        } 
        else {
          userContext += `\n\nThe user is asking about ${specificCategory} spending, but there are no recorded expenses in this category. Suggest adding expenses with this category to track spending.`;
        }
      }
      
      // Format general context for the AI with personalized language based on user profile
      userContext += `
Personal Information:
- Name: ${userName}
- Age: ${userAge !== null ? userAge : "Not provided"} (${ageCategory})
- Gender: ${userGender}
- Preferred Currency: ${userPreferredCurrency}

Monthly Overview:
- Income: ${formatCurrency(monthlyIncome, userPreferredCurrency)}
- Total spending this month: ${formatCurrency(userData.monthlyTotal, userPreferredCurrency)}
- Total spending last month: ${formatCurrency(userData.prevMonthTotal, userPreferredCurrency)}
${userData.savingsRate !== null ? `- Current savings rate: ${userData.savingsRate.toFixed(1)}%` : ''}
- Monthly change: ${userData.monthlyTotal > userData.prevMonthTotal ? 'Increased by ' : 'Decreased by '}${formatCurrency(Math.abs(userData.monthlyTotal - userData.prevMonthTotal), userPreferredCurrency)} (${((Math.abs(userData.monthlyTotal - userData.prevMonthTotal) / (userData.prevMonthTotal || 1)) * 100).toFixed(1)}%)

Spending Categories (This Month):
${Object.entries(userData.categorySpending)
  .sort((a, b) => b[1] - a[1])
  .map(([category, amount]) => `  * ${category}: ${formatCurrency(Number(amount), userPreferredCurrency)}`)
  .join('\n')}

Previous Month Categories:
${Object.entries(userData.prevCategorySpending)
  .sort((a, b) => b[1] - a[1])
  .map(([category, amount]) => `  * ${category}: ${formatCurrency(Number(amount), userPreferredCurrency)}`)
  .join('\n')}

Recent Activity:
- Latest Expenses: ${userData.recentExpenses ? userData.recentExpenses.slice(0, 5).map(exp => `${exp.category} (${formatCurrency(exp.amount, userPreferredCurrency)})`).join(', ') : "No recent expenses"}
- Active Budgets: ${userData.budgets ? userData.budgets.map(b => `${b.category} (${formatCurrency(b.amount, userPreferredCurrency)})`).join(', ') : "No budgets set"}

All expense categories used: ${userData.uniqueCategories.join(', ')}

IMPORTANT: Only use these predefined expense categories:
${EXPENSE_CATEGORIES.join(', ')}

IMPORTANT: When adding an expense:
- Today's date is ${getTodaysDate()}
- Always use this current date when the user says 'today' or doesn't specify a date
- NEVER use past years like 2022 or 2023 for expenses mentioned as current or recent

When responding to the user named ${userName}:
1. Use their name (${userName}) occasionally to make interactions personal
2. Adjust your tone based on their age group (${ageCategory})
3. Use communication style appropriate for their gender preference (${userGender})
4. Show all financial data in their preferred currency (${userPreferredCurrency})
5. Include relevant financial data in your responses
6. Offer specific suggestions based on their spending patterns
7. Highlight both positive trends and areas for improvement`;

    } catch (error) {
      console.error("Error fetching user context:", error);
      userContext = "Unable to retrieve user's financial context completely.";
    }

    // Look for emotional cues in the message to adjust tone
    const stressWords = ["urgent", "problem", "worried", "stress", "help", "emergency", "asap", "confused"];
    const hasStressSignals = stressWords.some(word => message.toLowerCase().includes(word));
    
    if (hasStressSignals) {
      userContext += "\n\nNOTE: The user appears to be showing signs of stress or urgency. Respond with extra patience, clarity, and empathy.";
    }

    // Analyze message formality to match tone
    const formalWords = ["kindly", "please", "would you", "could you", "thank you", "appreciate"];
    const casualWords = ["hey", "hi", "lol", "cool", "awesome", "thanks"];
    const userFormalityScore = 
      formalWords.filter(word => message.toLowerCase().includes(word)).length - 
      casualWords.filter(word => message.toLowerCase().includes(word)).length;
    
    if (userFormalityScore > 1) {
      userContext += "\n\nNOTE: The user is using a more formal communication style. Match with respectful, professional language.";
    } else if (userFormalityScore < -1) {
      userContext += "\n\nNOTE: The user is using a casual, relaxed communication style. Match with a friendly, conversational tone.";
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
    let action = null;
    
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
        action = goalAction;
        
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
        // parse the assistant's action
        action = JSON.parse(actionMatch[1]);
        let actionDataModified = false;

        // --- If it's an add_expense action ---
        if (action.type === 'add_expense') {
          const todaysDate = getTodaysDate();
          
          // Check if the date is missing, invalid, or contains "today" references
          if (!action.date || 
              new Date(action.date).getFullYear() !== new Date().getFullYear() ||
              message.toLowerCase().includes("today") ||
              message.toLowerCase().includes("now") ||
              message.toLowerCase().includes("current")) {
                
            action.date = todaysDate;
            actionDataModified = true;
            console.log(`Date was missing, invalid, or "today" was referenced. Using today's date: ${action.date}`);
          }
          
          // Always double check the date format and validity
          try {
            const dateObj = new Date(action.date);
            if (isNaN(dateObj.getTime())) {
              console.log(`Invalid date found: ${action.date}, using today's date`);
              action.date = todaysDate;
              actionDataModified = true;
            }
          } catch (e) {
            console.log(`Error parsing date: ${action.date}, using today's date`);
            action.date = todaysDate;
            actionDataModified = true;
          }
        }

        // now send it on to your processor
        const actionResult = await processAction(action, userId, supabase);

        // replace the marker with the confirmation
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
        visualData: visualData,
        action: action // Include action data in response
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
