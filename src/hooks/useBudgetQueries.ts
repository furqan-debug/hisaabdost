
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { MonthlyIncomeService } from "@/services/monthlyIncomeService";

export function useBudgetQueries(selectedMonth: Date) {
  const { user } = useAuth();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  
  console.log("useBudgetQueries: Starting queries for user:", user?.id, "month:", monthKey);
  
  // Query budgets with optimized settings
  const { data: budgets = [], isLoading: budgetsLoading, error: budgetsError } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("useBudgetQueries: No user, returning empty budgets");
        return [];
      }
      
      console.log("Fetching budgets for user:", user.id);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching budgets:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} budgets`);
      return data as Budget[];
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds - more responsive for budget updates
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: 'always', // Always refetch on mount for latest data
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  
  // Query monthly income with optimized settings
  const { data: incomeData = { monthlyIncome: 0 }, isLoading: incomeLoading, error: incomeError } = useQuery({
    queryKey: ['monthly_income', user?.id, monthKey],
    queryFn: async () => {
      if (!user) {
        console.log("useBudgetQueries: No user, returning default income");
        return { monthlyIncome: 0 };
      }
      
      console.log("Fetching income for user:", user.id, "month:", monthKey);
      
      try {
        const income = await MonthlyIncomeService.getMonthlyIncome(user.id, selectedMonth);
        console.log("Income from service:", income);
        
        return { monthlyIncome: income };
      } catch (error) {
        console.error("Error fetching income:", error);
        return { monthlyIncome: 0 };
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes - income changes less frequently
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Query expenses with optimized settings
  const { data: expenses = [], isLoading: expensesLoading, error: expensesError } = useQuery({
    queryKey: ['expenses', monthKey, user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("useBudgetQueries: No user, returning empty expenses");
        return [];
      }
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      console.log("Fetching expenses for user:", user.id, "month:", monthKey);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0]);

      if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} expenses for ${monthKey}`);
      return data || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes - keep responsive for expense tracking
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Log any errors
  if (budgetsError) console.error("Budgets query error:", budgetsError);
  if (incomeError) console.error("Income query error:", incomeError);
  if (expensesError) console.error("Expenses query error:", expensesError);

  const result = {
    budgets,
    expenses,
    incomeData,
    isLoading: budgetsLoading || expensesLoading || incomeLoading
  };
  
  console.log("useBudgetQueries: returning", result);
  return result;
}
