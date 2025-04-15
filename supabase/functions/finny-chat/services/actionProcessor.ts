
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export async function processAction(action: any, userId: string, supabase: any) {
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

async function deleteExpense(action: any, userId: string, supabase: any) {
  const { expenseId, category, date } = action;
  
  if (!expenseId) {
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

async function setBudget(action: any, userId: string, supabase: any) {
  const { category, amount, period } = action;
  
  if (!category || !amount) {
    throw new Error('Missing required fields for budget');
  }

  const { data: existingBudget, error: fetchError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category);

  if (fetchError) {
    throw new Error(`Failed to check existing budget: ${fetchError.message}`);
  }

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
  } else {
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

async function updateBudget(action: any, userId: string, supabase: any) {
  const { category, amount, period } = action;
  
  if (!category) {
    throw new Error('Category is required to update a budget');
  }

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

async function setGoal(action: any, userId: string, supabase: any) {
  const { title, targetAmount, deadline, category } = action;
  
  if (!title || !targetAmount) {
    throw new Error('Missing required fields for goal');
  }

  const { data: existingGoal, error: fetchError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('title', title);

  if (fetchError) {
    throw new Error(`Failed to check existing goal: ${fetchError.message}`);
  }

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
  } else {
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

async function updateGoal(action: any, userId: string, supabase: any) {
  const { goalId, title, targetAmount, currentAmount, deadline, category } = action;
  
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

