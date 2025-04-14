import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize OpenAI API key from environment variable
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Define the system message for Finny's personality and capabilities
const FINNY_SYSTEM_MESSAGE = `You are Finny, a smart and friendly financial assistant for the Expensify AI app.
Your role is to help users manage their expenses, budgets, and financial goals through natural conversation.

You should:
- Be friendly, professional, and encouraging
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
7. Answer personal finance queries

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
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: FINNY_SYSTEM_MESSAGE },
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

// Process actions based on the type
async function processAction(action: any, userId: string, supabase: any) {
  switch (action.type) {
    case 'add_expense':
      return await addExpense(action, userId, supabase);
    case 'update_expense':
      return await updateExpense(action, userId, supabase);
    case 'delete_expense':
      return await deleteExpense(action, userId, supabase);
    case 'set_budget':
      return await setBudget(action, userId, supabase);
    case 'update_budget':
      return await updateBudget(action, userId, supabase);
    case 'set_goal':
      return await setGoal(action, userId, supabase);
    case 'update_goal':
      return await updateGoal(action, userId, supabase);
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

// Add a new expense
async function addExpense(action: any, userId: string, supabase: any) {
  const { amount, category, date, description } = action;
  
  if (!amount || !category || !date) {
    throw new Error('Missing required fields for expense');
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      amount: parseFloat(amount),
      category,
      date,
      description: description || category,
      payment: action.paymentMethod || 'Card'
    });

  if (error) {
    throw new Error(`Failed to add expense: ${error.message}`);
  }

  return `I've added the ${category} expense of ${amount}`;
}

// Update an existing expense
async function updateExpense(action: any, userId: string, supabase: any) {
  const { expenseId, amount, category, date, description } = action;
  
  if (!expenseId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      throw new Error('Could not find the expense to update');
    }
    
    action.expenseId = data[0].id;
  }

  const updates: any = {};
  if (amount !== undefined) updates.amount = parseFloat(amount);
  if (category) updates.category = category;
  if (date) updates.date = date;
  if (description) updates.description = description;
  if (action.paymentMethod) updates.payment = action.paymentMethod;

  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', action.expenseId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update expense: ${error.message}`);
  }

  return `I've updated the expense for you`;
}

// Delete an expense
async function deleteExpense(action: any, userId: string, supabase: any) {
  const { expenseId, category, date } = action;
  
  if (!expenseId) {
    // Try to find the expense by category and possibly date
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category);
    
    if (date) {
      query = query.eq('date', date);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      throw new Error('Could not find the expense to delete');
    }
    
    action.expenseId = data[0].id;
  }

  const { data, error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', action.expenseId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete expense: ${error.message}`);
  }

  return `I've deleted the expense`;
}

// Set a budget
async function setBudget(action: any, userId: string, supabase: any) {
  const { category, amount, period } = action;
  
  if (!category || !amount) {
    throw new Error('Missing required fields for budget');
  }

  // Check if a budget already exists for this category
  const { data: existingBudget, error: fetchError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category);

  if (fetchError) {
    throw new Error(`Failed to check existing budget: ${fetchError.message}`);
  }

  // If budget exists, update it
  if (existingBudget && existingBudget.length > 0) {
    const { error } = await supabase
      .from('budgets')
      .update({
        amount: parseFloat(amount),
        period: period || 'monthly'
      })
      .eq('id', existingBudget[0].id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update budget: ${error.message}`);
    }

    return `I've updated your ${category} budget to ${amount}`;
  } 
  // Otherwise, create a new budget
  else {
    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category,
        amount: parseFloat(amount),
        period: period || 'monthly'
      });

    if (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }

    return `I've set your ${category} budget to ${amount}`;
  }
}

// Update an existing budget
async function updateBudget(action: any, userId: string, supabase: any) {
  const { category, amount, period } = action;
  
  if (!category) {
    throw new Error('Category is required to update a budget');
  }

  // Find the budget by category
  const { data, error: fetchError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category);

  if (fetchError) {
    throw new Error(`Failed to find budget: ${fetchError.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`No budget found for category: ${category}`);
  }

  const updates: any = {};
  if (amount !== undefined) updates.amount = parseFloat(amount);
  if (period) updates.period = period;

  const { error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', data[0].id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update budget: ${error.message}`);
  }

  return `I've updated your ${category} budget`;
}

// Set a financial goal
async function setGoal(action: any, userId: string, supabase: any) {
  const { title, targetAmount, deadline, category } = action;
  
  if (!title || !targetAmount) {
    throw new Error('Missing required fields for goal');
  }

  // Check if a similar goal already exists
  const { data: existingGoal, error: fetchError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('title', title);

  if (fetchError) {
    throw new Error(`Failed to check existing goal: ${fetchError.message}`);
  }

  // If goal exists, update it
  if (existingGoal && existingGoal.length > 0) {
    const { error } = await supabase
      .from('goals')
      .update({
        target_amount: parseFloat(targetAmount),
        deadline: deadline || null,
        category: category || existingGoal[0].category
      })
      .eq('id', existingGoal[0].id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update goal: ${error.message}`);
    }

    return `I've updated your goal "${title}" to ${targetAmount}`;
  } 
  // Otherwise, create a new goal
  else {
    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title,
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        deadline: deadline || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        category: category || 'Savings'
      });

    if (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    return `I've set your goal "${title}" with a target of ${targetAmount}`;
  }
}

// Update an existing goal
async function updateGoal(action: any, userId: string, supabase: any) {
  const { goalId, title, targetAmount, currentAmount, deadline, category } = action;
  
  // Find the goal either by ID or title
  let goalQuery = supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId);
  
  if (goalId) {
    goalQuery = goalQuery.eq('id', goalId);
  } else if (title) {
    goalQuery = goalQuery.eq('title', title);
  } else {
    throw new Error('Either goal ID or title is required to update a goal');
  }

  const { data, error: fetchError } = await goalQuery;

  if (fetchError) {
    throw new Error(`Failed to find goal: ${fetchError.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('No matching goal found');
  }

  const updates: any = {};
  if (targetAmount !== undefined) updates.target_amount = parseFloat(targetAmount);
  if (currentAmount !== undefined) updates.current_amount = parseFloat(currentAmount);
  if (deadline) updates.deadline = deadline;
  if (category) updates.category = category;
  if (title && title !== data[0].title) updates.title = title;

  const { error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', data[0].id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update goal: ${error.message}`);
  }

  return `I've updated your goal "${data[0].title}"`;
}
