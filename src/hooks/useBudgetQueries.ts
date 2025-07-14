
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useAuth } from "@/lib/auth";
import { MonthlyIncomeService } from "@/services/monthlyIncomeService";

export function useBudgetQueries(selectedMonth: Date, refreshTrigger: number) {
  const { user } = useAuth();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  
  // Query budgets with forced refresh
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', monthKey, user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching budgets for user:", user.id, "refreshTrigger:", refreshTrigger);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching budgets:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} budgets:`, data);
      return data as Budget[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  
  // Query monthly income using the new service
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id, monthKey, refreshTrigger],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      console.log("Fetching income for user:", user.id, "month:", monthKey, "refreshTrigger:", refreshTrigger);
      
      const income = await MonthlyIncomeService.getMonthlyIncome(user.id, selectedMonth);
      console.log("Income from service:", income);
      
      return { monthlyIncome: income };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Query expenses with forced refresh
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', monthKey, user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      console.log("Fetching expenses for user:", user.id, "month:", monthKey, "refreshTrigger:", refreshTrigger);
      
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    budgets,
    expenses,
    incomeData,
    isLoading: budgetsLoading || expensesLoading || incomeLoading
  };
}
