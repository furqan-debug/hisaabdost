
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

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
 * Validate and normalize a category against allowed expense categories
 */
function validateCategory(category: string): string {
  if (!category) return 'Other';
  
  // Check for exact match
  const exactMatch = EXPENSE_CATEGORIES.find(
    c => c.toLowerCase() === category.toLowerCase()
  );
  
  if (exactMatch) return exactMatch;
  
  // Look for partial matches
  const partialMatches = EXPENSE_CATEGORIES.filter(
    c => c.toLowerCase().includes(category.toLowerCase()) || 
         category.toLowerCase().includes(c.toLowerCase())
  );
  
  if (partialMatches.length > 0) {
    return partialMatches[0]; // Return the first partial match
  }
  
  // No match found, use Other as fallback
  return 'Other';
}

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
    case 'delete_budget':
      return await deleteBudget(action, userId, supabase);
    case 'set_goal':
      return await setGoal(action, userId, supabase);
    case 'update_goal':
      return await updateGoal(action, userId, supabase);
    case 'delete_goal':
      return await deleteGoal(action, userId, supabase);
    case 'get_spending':
      return await getSpending(action, userId, supabase);
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

async function addExpense(action: any, userId: string, supabase: any) {
  const { amount, category, date, description } = action;
  
  if (!amount || !category) {
    throw new Error('Missing required fields for expense');
  }

  if (parseFloat(amount) <= 0) {
    throw new Error('Expense amount must be greater than zero');
  }
  
  // Validate the category
  const validCategory = validateCategory(category);
  let responseMessage = `I've added the ${validCategory} expense of ${amount}`;
  
  if (validCategory !== category) {
    responseMessage += ` (using "${validCategory}" as the category instead of "${category}")`;
  }
  
  // If no date is provided, use today's date
  let expenseDate = date;
  if (!expenseDate) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    expenseDate = `${yyyy}-${mm}-${dd}`;
  } else {
    // Validate the date - make sure it's not too far in the past or future
    const providedDate = new Date(expenseDate);
    const currentYear = new Date().getFullYear();
    
    // Check if the date is valid and within a reasonable range (2020-2030)
    if (isNaN(providedDate.getTime()) || providedDate.getFullYear() < 2020 || providedDate.getFullYear() > 2030) {
      // If invalid date or outside range, use today's date
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      expenseDate = `${yyyy}-${mm}-${dd}`;
      responseMessage += " (using today's date because the provided date was invalid or outside the reasonable range)";
    }
  }

 const { data, error } = await supabase
  .from('expenses')
  .insert({
    user_id: userId,
    amount: parseFloat(amount),
    category: validCategory,
    date: expenseDate,
    description: description || validCategory,
    payment: action.paymentMethod || 'Card'
  });

if (error) {
  console.error("INSERT ERROR:", error);
  throw new Error(`Failed to add expense: ${error.message}`);
}
  
if (!userId) {
  throw new Error("Missing user ID — cannot insert expense.");
}

  return responseMessage;
}

async function updateExpense(action: any, userId: string, supabase: any) {
  const { expenseId, amount, category, date, description } = action;
  
  let targetExpenseId = expenseId;
  
  if (!targetExpenseId) {
    if (!category) {
      throw new Error('Either expense ID or category is required to update an expense');
    }
    
    // Validate the category for lookup
    const validCategory = validateCategory(category);
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('category', validCategory)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      throw new Error('Could not find the expense to update');
    }
    
    targetExpenseId = data[0].id;
  }

  const updates: any = {};
  if (amount !== undefined) {
    if (parseFloat(amount) <= 0) {
      throw new Error('Expense amount must be greater than zero');
    }
    updates.amount = parseFloat(amount);
  }
  if (category) {
    // Validate the category for the update
    updates.category = validateCategory(category);
  }
  if (date) updates.date = date;
  if (description) updates.description = description;
  if (action.paymentMethod) updates.payment = action.paymentMethod;

  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', targetExpenseId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update expense: ${error.message}`);
  }

  let responseMessage = `I've updated the expense for you`;
  if (category && updates.category !== category) {
    responseMessage += ` (using "${updates.category}" as the category instead of "${category}")`;
  }
  
  return responseMessage;
}

async function deleteExpense(action: any, userId: string, supabase: any) {
  const { expenseId, category, date } = action;
  
  if (!expenseId && !category) {
    throw new Error('Either expense ID or category is required to delete an expense');
  }

  if (Array.isArray(expenseId) && expenseId.length > 0) {
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .in('id', expenseId)
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Failed to delete expenses: ${error.message}`);
    }
    
    return `I've deleted ${expenseId.length} expenses`;
  }
  
  if (!expenseId) {
    // Validate the category for lookup
    const validCategory = validateCategory(category);
    
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('category', validCategory);
    
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

  if (parseFloat(amount) <= 0) {
    throw new Error('Budget amount must be greater than zero');
  }
  
  // Validate the category
  const validCategory = validateCategory(category);

  const { data: existingBudget, error: fetchError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('category', validCategory);

  if (fetchError) {
    throw new Error(`Failed to check existing budget: ${fetchError.message}`);
  }

  let responseMessage;
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

    responseMessage = `I've updated your ${validCategory} budget to ${amount}`;
  } else {
    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        category: validCategory,
        amount: parseFloat(amount),
        period: period || 'monthly'
      });

    if (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }

    responseMessage = `I've set your ${validCategory} budget to ${amount}`;
  }
  
  if (validCategory !== category) {
    responseMessage += ` (using "${validCategory}" as the category instead of "${category}")`;
  }
  
  return responseMessage;
}

async function updateBudget(action: any, userId: string, supabase: any) {
  const { category, amount, period } = action;
  
  if (!category) {
    throw new Error('Category is required to update a budget');
  }
  
  // Validate the category
  const validCategory = validateCategory(category);

  const { data, error: fetchError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('category', validCategory);

  if (fetchError) {
    throw new Error(`Failed to find budget: ${fetchError.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`No budget found for category: ${validCategory}`);
  }

  const updates: any = {};
  if (amount !== undefined) {
    if (parseFloat(amount) <= 0) {
      throw new Error('Budget amount must be greater than zero');
    }
    updates.amount = parseFloat(amount);
  }
  if (period) updates.period = period;

  const { error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', data[0].id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update budget: ${error.message}`);
  }

  let responseMessage = `I've updated your ${validCategory} budget`;
  if (validCategory !== category) {
    responseMessage += ` (using "${validCategory}" as the category instead of "${category}")`;
  }
  
  return responseMessage;
}

async function deleteBudget(action: any, userId: string, supabase: any) {
  const { category, budgetId } = action;
  
  if (!budgetId && !category) {
    throw new Error('Either budget ID or category is required to delete a budget');
  }
  
  let targetBudgetId = budgetId;
  
  if (!targetBudgetId) {
    // Validate the category
    const validCategory = validateCategory(category);
    
    const { data, error } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category', validCategory)
      .single();
    
    if (error || !data) {
      throw new Error(`Could not find a budget for category: ${validCategory}`);
    }
    
    targetBudgetId = data.id;
  }

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', targetBudgetId)
    .eq('user_id', userId);
  
  if (error) {
    throw new Error(`Failed to delete budget: ${error.message}`);
  }
  
  return `I've deleted the budget`;
}

async function setGoal(action: any, userId: string, supabase: any) {
  const { title, targetAmount, deadline, category } = action;
  
  const goalTitle = title || "Savings Goal";
  const targetAmt = targetAmount || 0;
  
  if (targetAmt <= 0) {
    throw new Error('Goal amount must be greater than zero');
  }

  const { data: existingGoal, error: fetchError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('title', goalTitle);

  if (fetchError) {
    console.error('Failed to check existing goal:', fetchError);
    throw new Error(`Failed to check existing goal: ${fetchError.message}`);
  }

  let formattedDeadline = deadline;
  if (deadline && typeof deadline === 'string') {
    if (deadline.includes('/')) {
      const [month, day, year] = deadline.split('/');
      formattedDeadline = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (deadline.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)) {
      const parts = deadline.split('/');
      formattedDeadline = `20${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    } else if (deadline.match(/\d{1,2}-\d{1,2}-\d{2,4}/)) {
      formattedDeadline = deadline;
    } else {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      
      if (deadline.toLowerCase().includes('january') || deadline.toLowerCase().includes('jan')) {
        formattedDeadline = `${nextYear}-01-31`;
      } else if (deadline.toLowerCase().includes('february') || deadline.toLowerCase().includes('feb')) {
        formattedDeadline = `${nextYear}-02-28`;
      } else if (deadline.toLowerCase().includes('march') || deadline.toLowerCase().includes('mar')) {
        formattedDeadline = `${nextYear}-03-31`;
      } else if (deadline.toLowerCase().includes('april') || deadline.toLowerCase().includes('apr')) {
        formattedDeadline = `${nextYear}-04-30`;
      } else if (deadline.toLowerCase().includes('may')) {
        formattedDeadline = `${nextYear}-05-31`;
      } else if (deadline.toLowerCase().includes('june') || deadline.toLowerCase().includes('jun')) {
        formattedDeadline = `${nextYear}-06-30`;
      } else if (deadline.toLowerCase().includes('july') || deadline.toLowerCase().includes('jul')) {
        formattedDeadline = `${nextYear}-07-31`;
      } else if (deadline.toLowerCase().includes('august') || deadline.toLowerCase().includes('aug')) {
        formattedDeadline = `${nextYear}-08-31`;
      } else if (deadline.toLowerCase().includes('september') || deadline.toLowerCase().includes('sept') || deadline.toLowerCase().includes('sep')) {
        formattedDeadline = `${nextYear}-09-30`;
      } else if (deadline.toLowerCase().includes('october') || deadline.toLowerCase().includes('oct')) {
        formattedDeadline = `${nextYear}-10-31`;
      } else if (deadline.toLowerCase().includes('november') || deadline.toLowerCase().includes('nov')) {
        formattedDeadline = `${nextYear}-11-30`;
      } else if (deadline.toLowerCase().includes('december') || deadline.toLowerCase().includes('dec')) {
        formattedDeadline = `${nextYear}-12-31`;
      } else {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        formattedDeadline = oneYearFromNow.toISOString().split('T')[0];
      }
    }
  } else if (!formattedDeadline) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    formattedDeadline = oneYearFromNow.toISOString().split('T')[0];
  }

  console.log(`Setting goal: ${goalTitle} for ${targetAmt} with deadline ${formattedDeadline}`);

  if (existingGoal && existingGoal.length > 0) {
    const { error } = await supabase
      .from('goals')
      .update({
        target_amount: parseFloat(targetAmt.toString()),
        deadline: formattedDeadline,
        category: category || existingGoal[0].category || 'Savings'
      })
      .eq('id', existingGoal[0].id)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to update goal:', error);
      throw new Error(`Failed to update goal: ${error.message}`);
    }

    return `I've updated your goal "${goalTitle}" to ${targetAmt}`;
  } else {
    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: goalTitle,
        target_amount: parseFloat(targetAmt.toString()),
        current_amount: 0,
        deadline: formattedDeadline,
        category: category || 'Savings'
      });

    if (error) {
      console.error('Failed to create goal:', error);
      throw new Error(`Failed to create goal: ${error.message}`);
    }

    return `I've set your goal "${goalTitle}" with a target of ${targetAmt}`;
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
  if (targetAmount !== undefined) {
    if (parseFloat(targetAmount) <= 0) {
      throw new Error('Goal target amount must be greater than zero');
    }
    updates.target_amount = parseFloat(targetAmount);
  }
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

async function deleteGoal(action: any, userId: string, supabase: any) {
  const { goalId, title } = action;
  
  if (!goalId && !title) {
    throw new Error('Either goal ID or title is required to delete a goal');
  }
  
  let goalQuery = supabase
    .from('goals')
    .delete()
    .eq('user_id', userId);
  
  if (goalId) {
    goalQuery = goalQuery.eq('id', goalId);
  } else {
    goalQuery = goalQuery.eq('title', title);
  }
  
  const { error } = await goalQuery;
  
  if (error) {
    throw new Error(`Failed to delete goal: ${error.message}`);
  }
  
  return `I've deleted the goal${title ? ` "${title}"` : ''}`;
}

async function getSpending(action: any, userId: string, supabase: any) {
  const { category, period } = action;
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  let query = supabase
    .from('expenses')
    .select('amount, category, date')
    .eq('user_id', userId);
  
  if (period === 'current_month' || !period) {
    query = query
      .gte('date', firstDayOfMonth)
      .lte('date', lastDayOfMonth);
  } else if (period === 'previous_month') {
    const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    query = query
      .gte('date', firstDayOfPrevMonth)
      .lte('date', lastDayOfMonth);
  } else if (period === 'year_to_date') {
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    query = query
      .gte('date', firstDayOfYear)
      .lte('date', lastDayOfMonth);
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to get spending data: ${error.message}`);
  }
  
  const total = data.reduce((sum, expense) => sum + Number(expense.amount), 0);
  
  const byCategory: Record<string, number> = {};
  data.forEach(expense => {
    byCategory[expense.category] = (byCategory[expense.category] || 0) + Number(expense.amount);
  });
  
  const periodText = period === 'previous_month' ? 'last month' : period === 'year_to_date' ? 'this year' : 'this month';
  const response = `Here's your spending breakdown for ${periodText}: $${total.toFixed(2)} total`;
  
  return response;
}
