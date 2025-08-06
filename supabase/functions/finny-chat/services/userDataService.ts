
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { formatCurrency } from "../utils/formatters.ts";
import { fetchUserCategories } from "./categoryService.ts";

export async function fetchUserFinancialData(
  userId: string, 
  supabase: SupabaseClient,
  currencyCode: string = 'USD'
): Promise<any> {
  console.log("Fetching financial data for user:", userId);
  
  try {
    // Fetch recent expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
    }

    // Fetch budgets
    const { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (budgetsError) {
      console.error('Error fetching budgets:', budgetsError);
    }

    // Calculate total expenses for current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = expenses?.filter(exp => 
      exp.date.startsWith(currentMonth)
    ) || [];
    
    const totalThisMonth = monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Get user's available categories (including custom ones)
    const userCategories = await fetchUserCategories(userId, supabase);

    return {
      recentExpenses: expenses || [],
      budgets: budgets || [],
      categories: userCategories,
      summary: `Total expenses this month: ${formatCurrency(totalThisMonth, currencyCode)}. ${expenses?.length || 0} recent transactions.`,
      monthlyTotal: totalThisMonth
    };
  } catch (error) {
    console.error('Error in fetchUserFinancialData:', error);
    return {
      recentExpenses: [],
      budgets: [],
      categories: [],
      summary: `Unable to fetch financial data. Please try again.`,
      monthlyTotal: 0
    };
  }
}
