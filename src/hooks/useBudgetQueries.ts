
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useAuth } from "@/lib/auth";

export function useBudgetQueries(selectedMonth: Date, refreshTrigger: number) {
  const { user } = useAuth();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  
  // Query budgets
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', monthKey, user?.id, refreshTrigger],
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
      
      console.log(`Fetched ${data?.length || 0} budgets:`, data);
      return data as Budget[];
    },
    enabled: !!user,
    staleTime: 1000,
  });
  
  // Query monthly income
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      const { data, error } = await supabase
        .from('budgets')
        .select('monthly_income')
        .eq('user_id', user.id)
        .limit(1);
        
      if (error) throw error;
      return { monthlyIncome: data?.[0]?.monthly_income || 0 };
    },
    enabled: !!user,
  });

  // Query expenses
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', monthKey, user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
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
  });

  return {
    budgets,
    expenses,
    incomeData,
    isLoading: budgetsLoading || expensesLoading || incomeLoading
  };
}
