
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useAuth } from "@/lib/auth";

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
    staleTime: 0, // Always consider data stale to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // Query monthly income with forced refresh
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      console.log("Fetching income for user:", user.id, "refreshTrigger:", refreshTrigger);
      
      // First try to get from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('monthly_income')
        .eq('id', user.id)
        .single();
        
      if (!profileError && profileData?.monthly_income) {
        console.log("Income from profiles:", profileData.monthly_income);
        return { monthlyIncome: profileData.monthly_income };
      }
      
      // Fallback to budgets table
      const { data, error } = await supabase
        .from('budgets')
        .select('monthly_income')
        .eq('user_id', user.id)
        .limit(1);
        
      if (error) throw error;
      const income = data?.[0]?.monthly_income || 0;
      console.log("Income from budgets fallback:", income);
      return { monthlyIncome: income };
    },
    enabled: !!user,
    staleTime: 0, // Always consider data stale to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
    staleTime: 0, // Always consider data stale to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    budgets,
    expenses,
    incomeData,
    isLoading: budgetsLoading || expensesLoading || incomeLoading
  };
}
