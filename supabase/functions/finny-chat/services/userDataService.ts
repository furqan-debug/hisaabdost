
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { formatCurrency } from "../utils/formatters.ts";

interface UserData {
  monthlyExpenses: any[];
  recentExpenses: any[];
  budgets: any[];
  monthlyTotal: number;
  prevMonthTotal: number;
  savingsRate: number | null;
  categorySpending: Record<string, number>;
  prevCategorySpending: Record<string, number>;
  uniqueCategories: string[];
  categoryDetails: Record<string, any[]>;
}

export async function fetchUserFinancialData(
  supabase: any,
  userId: string,
  monthlyIncome: number = 0
): Promise<UserData> {
  // Get current month range
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  const firstDayOfPrevMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

  // Fetch ALL expense categories
  const { data: allCategories, error: categoriesError } = await supabase
    .from('expenses')
    .select('category')
    .eq('user_id', userId)
    .order('category', { ascending: true });

  if (categoriesError) throw categoriesError;

  // Get unique categories
  const uniqueCategories = [...new Set(allCategories?.map(item => item.category))];

  // Fetch recent expenses
  const { data: recentExpenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(15);

  if (expensesError) throw expensesError;

  // Fetch budget information
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (budgetsError) throw budgetsError;

  // Calculate total spending this month
  const { data: monthlyExpenses, error: monthlyError } = await supabase
    .from('expenses')
    .select('amount, category, description, date, payment, notes')
    .eq('user_id', userId)
    .gte('date', firstDayOfMonth)
    .lte('date', lastDayOfMonth);

  if (monthlyError) throw monthlyError;

  // Calculate last month's spending
  const { data: prevMonthExpenses, error: prevMonthError } = await supabase
    .from('expenses')
    .select('amount, category, description, date')
    .eq('user_id', userId)
    .gte('date', firstDayOfPrevMonth)
    .lte('date', lastDayOfPrevMonth);

  if (prevMonthError) throw prevMonthError;

  // Calculate spending by category
  const categorySpending: Record<string, number> = {};
  const categoryDetails: Record<string, any[]> = {};
  
  monthlyExpenses?.forEach(exp => {
    categorySpending[exp.category] = (categorySpending[exp.category] || 0) + Number(exp.amount);
    
    // Group expenses by category for detailed analysis
    if (!categoryDetails[exp.category]) {
      categoryDetails[exp.category] = [];
    }
    categoryDetails[exp.category].push({
      amount: Number(exp.amount),
      description: exp.description,
      date: exp.date,
      payment: exp.payment,
      notes: exp.notes
    });
  });

  const prevCategorySpending: Record<string, number> = {};
  prevMonthExpenses?.forEach(exp => {
    prevCategorySpending[exp.category] = (prevCategorySpending[exp.category] || 0) + Number(exp.amount);
  });

  const monthlyTotal = monthlyExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  const prevMonthTotal = prevMonthExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

  // Calculate savings rate if income is available
  const savingsRate = monthlyIncome > 0 
    ? ((monthlyIncome - monthlyTotal) / monthlyIncome) * 100 
    : null;

  return {
    monthlyExpenses,
    recentExpenses,
    budgets,
    monthlyTotal,
    prevMonthTotal,
    savingsRate,
    categorySpending,
    prevCategorySpending,
    uniqueCategories,
    categoryDetails
  };
}
