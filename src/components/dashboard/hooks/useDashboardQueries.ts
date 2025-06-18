
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useExpenseRefresh } from "@/hooks/useExpenseRefresh";

export function useDashboardQueries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const monthContext = useMonthContext();
  
  // Ensure we get a valid refresh trigger
  const expenseRefreshResult = useExpenseRefresh();
  const refreshTrigger = expenseRefreshResult?.refreshTrigger ?? 0;
  
  // Safely extract values from context with fallbacks
  const selectedMonth = monthContext?.selectedMonth || new Date();
  const currentMonthKey = selectedMonth ? format(selectedMonth, 'yyyy-MM') : '';
  
  // Fetch monthly income from Supabase - checking both profiles and budgets tables
  const { data: incomeData, isLoading: isIncomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      try {
        console.log("Fetching monthly income for user:", user.id);
        
        // First check profiles table for monthly income (primary source)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('monthly_income')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profileData?.monthly_income) {
          console.log("Found monthly income in profiles table:", profileData.monthly_income);
          return { monthlyIncome: profileData.monthly_income };
        }
        
        // Fallback: check budgets table for monthly income
        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .select('monthly_income')
          .eq('user_id', user.id)
          .limit(1);
          
        if (budgetError) {
          console.warn("Error fetching from budgets table:", budgetError);
        }
        
        // If we have income data in budgets, use that
        if (budgetData && budgetData.length > 0 && budgetData[0].monthly_income) {
          console.log("Found monthly income in budgets table:", budgetData[0].monthly_income);
          return { monthlyIncome: budgetData[0].monthly_income };
        }
        
        console.log("No monthly income found in either table, defaulting to 0");
        return { monthlyIncome: 0 };
      } catch (error) {
        console.error("Error fetching monthly income:", error);
        return { monthlyIncome: 0 };
      }
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
  });
  
  // Fetch current month's expenses from Supabase using React Query
  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses', currentMonthKey, refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user || !selectedMonth) return [];
      
      console.log("Fetching expenses for month:", currentMonthKey);
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      
      console.log(`Fetched ${data.length} expenses for the month`);
      
      return data.map(exp => ({
        id: exp.id,
        amount: Number(exp.amount),
        description: exp.description,
        date: exp.date,
        category: exp.category,
        paymentMethod: exp.payment || undefined,
        notes: exp.notes || undefined,
        isRecurring: exp.is_recurring || false,
        receiptUrl: exp.receipt_url || undefined,
      }));
    },
    enabled: !!user && !!selectedMonth,
  });

  // Fetch ALL expenses for the last 6 months for spending trends
  const { data: allExpenses = [] } = useQuery({
    queryKey: ['all_expenses', refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching all expenses for spending trends");
      
      // Get expenses from 6 months ago to now
      const sixMonthsAgo = subMonths(new Date(), 5);
      const startDate = startOfMonth(sixMonthsAgo);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching all expenses:', error);
        return [];
      }
      
      console.log(`Fetched ${data.length} total expenses for spending trends`);
      
      return data.map(exp => ({
        id: exp.id,
        amount: Number(exp.amount),
        description: exp.description,
        date: exp.date,
        category: exp.category,
        paymentMethod: exp.payment || undefined,
        notes: exp.notes || undefined,
        isRecurring: exp.is_recurring || false,
        receiptUrl: exp.receipt_url || undefined,
      }));
    },
    enabled: !!user,
  });

  // Handle manual expense refreshing
  const handleExpenseRefresh = () => {
    if (selectedMonth) {
      queryClient.invalidateQueries({ queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')] });
    }
    queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
    queryClient.invalidateQueries({ queryKey: ['monthly_income'] }); // Also refresh income data
  };

  return {
    incomeData,
    isIncomeLoading,
    expenses: Array.isArray(expenses) ? expenses : [],
    allExpenses: Array.isArray(allExpenses) ? allExpenses : [],
    isExpensesLoading,
    handleExpenseRefresh,
    selectedMonth,
    currentMonthKey
  };
}
