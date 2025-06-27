// Import Supabase client type
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Import action handlers
import { addExpense, updateExpense, deleteExpense } from "../actions/expenseActions.ts";
import { setBudget, deleteBudget } from "../actions/budgetActions.ts";
import { setGoal, updateGoal, deleteGoal } from "../actions/goalActions.ts";
import { addWalletFunds } from "../actions/walletActions.ts";
import { setIncome } from "../actions/incomeActions.ts";

// Process user actions
export async function processAction(
  actionData: any,
  userId: string,
  supabase: any
): Promise<string> {
  try {
    console.log('Processing action:', actionData);

    switch (actionData.type) {
      case 'add_expense':
        return await addExpense(actionData, userId, supabase);
      
      case 'update_expense':
        return await updateExpense(actionData, userId, supabase);
      
      case 'delete_expense':
        return await deleteExpense(actionData, userId, supabase);
      
      case 'set_budget':
        return await setBudget(actionData, userId, supabase);
      
      case 'update_budget':
        return await updateBudget(actionData, userId, supabase);
      
      case 'delete_budget':
        return await deleteBudget(actionData, userId, supabase);
      
      case 'set_goal':
        return await setGoal(actionData, userId, supabase);
      
      case 'update_goal':
        return await updateGoal(actionData, userId, supabase);
      
      case 'delete_goal':
        return await deleteGoal(actionData, userId, supabase);
      
      case 'add_wallet_funds':
        return await addWalletFunds(actionData, userId, supabase);
      
      case 'set_income':
        return await setIncome(actionData, userId, supabase);
      
      case 'update_income':
        return await updateIncome(actionData, userId, supabase);
      
      default:
        return `I'm not sure how to handle that action type: ${actionData.type}`;
    }
  } catch (error) {
    console.error('Error processing action:', error);
    return `Something went wrong while processing that action: ${error.message}`;
  }
}

async function addExpense(actionData: any, userId: string, supabase: any): Promise<string> {
  const { amount, category, date, description } = actionData;
  
  const { error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      amount: parseFloat(amount),
      category,
      date,
      description: description || '',
      payment_method: 'Cash'
    });

  if (error) {
    console.error('Error adding expense:', error);
    return `I couldn't add that expense: ${error.message}`;
  }

  return `✅ Added your ${description || category.toLowerCase()} expense of $${amount}`;
}

async function updateExpense(actionData: any, userId: string, supabase: any): Promise<string> {
  const { id, amount, category, date, description } = actionData;
  
  const updateData: any = {};
  if (amount !== undefined) updateData.amount = parseFloat(amount);
  if (category !== undefined) updateData.category = category;
  if (date !== undefined) updateData.date = date;
  if (description !== undefined) updateData.description = description;
  
  const { error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating expense:', error);
    return `I couldn't update that expense: ${error.message}`;
  }

  return `✅ Updated your expense successfully`;
}

async function deleteExpense(actionData: any, userId: string, supabase: any): Promise<string> {
  const { category, date, amount } = actionData;
  
  let query = supabase
    .from('expenses')
    .delete()
    .eq('user_id', userId);
    
  if (category) query = query.eq('category', category);
  if (date) query = query.eq('date', date);
  if (amount) query = query.eq('amount', parseFloat(amount));
  
  // Add limit to prevent accidental mass deletion
  query = query.limit(1);
  
  const { error } = await query;

  if (error) {
    console.error('Error deleting expense:', error);
    return `I couldn't delete that expense: ${error.message}`;
  }

  return `✅ Deleted your expense`;
}

async function setBudget(actionData: any, userId: string, supabase: any): Promise<string> {
  const { category, amount, period = 'monthly' } = actionData;
  
  const { error } = await supabase
    .from('budgets')
    .upsert({
      user_id: userId,
      category,
      amount: parseFloat(amount),
      period
    });

  if (error) {
    console.error('Error setting budget:', error);
    return `I couldn't set that budget: ${error.message}`;
  }

  return `✅ Set your ${category} budget to $${amount} per ${period}`;
}

async function updateBudget(actionData: any, userId: string, supabase: any): Promise<string> {
  const { category, amount, period } = actionData;
  
  const updateData: any = {};
  if (amount !== undefined) updateData.amount = parseFloat(amount);
  if (period !== undefined) updateData.period = period;
  
  const { error } = await supabase
    .from('budgets')
    .update(updateData)
    .eq('user_id', userId)
    .eq('category', category);

  if (error) {
    console.error('Error updating budget:', error);
    return `I couldn't update that budget: ${error.message}`;
  }

  return `✅ Updated your ${category} budget`;
}

async function deleteBudget(actionData: any, userId: string, supabase: any): Promise<string> {
  const { category } = actionData;
  
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', userId)
    .eq('category', category);

  if (error) {
    console.error('Error deleting budget:', error);
    return `I couldn't delete that budget: ${error.message}`;
  }

  return `✅ Removed your ${category} budget`;
}

async function setGoal(actionData: any, userId: string, supabase: any): Promise<string> {
  const { title, targetAmount, deadline, category = 'Savings' } = actionData;
  
  const { error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      title,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      deadline,
      category
    });

  if (error) {
    console.error('Error setting goal:', error);
    return `I couldn't create that goal: ${error.message}`;
  }

  return `✅ Created your "${title}" goal with a target of $${targetAmount}`;
}

async function updateGoal(actionData: any, userId: string, supabase: any): Promise<string> {
  const { title, targetAmount, currentAmount, deadline } = actionData;
  
  const updateData: any = {};
  if (targetAmount !== undefined) updateData.target_amount = parseFloat(targetAmount);
  if (currentAmount !== undefined) updateData.current_amount = parseFloat(currentAmount);
  if (deadline !== undefined) updateData.deadline = deadline;
  
  const { error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('user_id', userId)
    .eq('title', title);

  if (error) {
    console.error('Error updating goal:', error);
    return `I couldn't update that goal: ${error.message}`;
  }

  return `✅ Updated your "${title}" goal`;
}

async function deleteGoal(actionData: any, userId: string, supabase: any): Promise<string> {
  const { title } = actionData;
  
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('user_id', userId)
    .eq('title', title);

  if (error) {
    console.error('Error deleting goal:', error);
    return `I couldn't delete that goal: ${error.message}`;
  }

  return `✅ Deleted your "${title}" goal`;
}

async function addWalletFunds(actionData: any, userId: string, supabase: any): Promise<string> {
  const { amount, description = 'Added funds' } = actionData;
  
  const { error } = await supabase
    .from('wallet_additions')
    .insert({
      user_id: userId,
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString().split('T')[0]
    });

  if (error) {
    console.error('Error adding wallet funds:', error);
    return `I couldn't add those funds: ${error.message}`;
  }

  return `✅ Added $${amount} to your wallet`;
}

async function setIncome(actionData: any, userId: string, supabase: any): Promise<string> {
  const { amount, period = 'monthly' } = actionData;
  
  const { error } = await supabase
    .from('profiles')
    .update({
      monthly_income: parseFloat(amount)
    })
    .eq('id', userId);

  if (error) {
    console.error('Error setting income:', error);
    return `I couldn't set your income: ${error.message}`;
  }

  return `✅ Set your ${period} income to $${amount}`;
}

async function updateIncome(actionData: any, userId: string, supabase: any): Promise<string> {
  return await setIncome(actionData, userId, supabase);
}
