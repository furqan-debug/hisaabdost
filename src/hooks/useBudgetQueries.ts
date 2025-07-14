
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { MonthlyIncomeService } from "@/services/monthlyIncomeService";

export function useBudgetQueries(selectedMonth: Date, refreshTrigger?: number) {
  const { user } = useAuth();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  
  // Query budgets with better loading behavior
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
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
    staleTime: 1000 * 30, // Reduced to 30 seconds
    refetchOnMount: true, // Enable refetch on mount
    refetchOnWindowFocus: false,
  });
  
  // Query monthly income with better loading behavior
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      console.log("Fetching income for user:", user.id, "month:", monthKey);
      
      const income = await MonthlyIncomeService.getMonthlyIncome(user.id, selectedMonth);
      console.log("Income from service:", income);
      
      return { monthlyIncome: income };
    },
    enabled: !!user,
    staleTime: 1000 * 30, // Reduced to 30 seconds
    refetchOnMount: true, // Enable refetch on mount
    refetchOnWindowFocus: false,
  });

  // Query expenses with better loading behavior
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', monthKey, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      console.log("Fetching expenses for user:", user.id, "month:", monthKey);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0]);

      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} expenses for ${monthKey}`);
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // Reduced to 30 seconds
    refetchOnMount: true, // Enable refetch on mount
    refetchOnWindowFocus: false,
  });

  return {
    budgets,
    expenses,
    incomeData,
    isLoading: budgetsLoading || expensesLoading || incomeLoading
  };
}
