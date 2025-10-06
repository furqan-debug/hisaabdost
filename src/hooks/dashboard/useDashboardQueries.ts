
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Expense } from "@/components/expenses/types";
import { MonthlyIncomeService } from "@/services/monthlyIncomeService";
import { useFamilyContext } from "@/hooks/useFamilyContext";

export function useDashboardQueries(selectedMonth: Date) {
  const { user } = useAuth();
  const { activeFamilyId, isPersonalMode } = useFamilyContext();
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');

  // Fetch monthly income
  const incomeQuery = useQuery({
    queryKey: ['monthly_income', user?.id, currentMonthKey, isPersonalMode ? 'personal' : activeFamilyId],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      const income = await MonthlyIncomeService.getMonthlyIncome(user.id, selectedMonth, activeFamilyId, isPersonalMode);
      return { monthlyIncome: income };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch current month's expenses
  const expensesQuery = useQuery({
    queryKey: ['expenses', currentMonthKey, user?.id, isPersonalMode ? 'personal' : activeFamilyId],
    queryFn: async () => {
      if (!user) return [];
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      let query = supabase
        .from('expenses')
        .select('*')
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      // Filter by family context
      if (isPersonalMode) {
        query = query.eq('user_id', user.id).is('family_id', null);
      } else if (activeFamilyId) {
        query = query.eq('family_id', activeFamilyId);
      } else {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      
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
    staleTime: 1000 * 60 * 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch all expenses for analytics (last 6 months)
  const allExpensesQuery = useQuery({
    queryKey: ['all_expenses', user?.id, isPersonalMode ? 'personal' : activeFamilyId],
    queryFn: async () => {
      if (!user) return [];
      
      const sixMonthsAgo = subMonths(new Date(), 5);
      const startDate = startOfMonth(sixMonthsAgo);
      
      let query = supabase
        .from('expenses')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      // Filter by family context
      if (isPersonalMode) {
        query = query.eq('user_id', user.id).is('family_id', null);
      } else if (activeFamilyId) {
        query = query.eq('family_id', activeFamilyId);
      } else {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching all expenses:', error);
        return [];
      }
      
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
    enabled: !!user && (expensesQuery.data?.length || 0) > 0,
    staleTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    incomeQuery,
    expensesQuery,
    allExpensesQuery,
    expenses: expensesQuery.data || [],
    allExpenses: allExpensesQuery.data || [],
    isExpensesLoading: expensesQuery.isLoading,
    isIncomeLoading: incomeQuery.isLoading,
    incomeData: incomeQuery.data
  };
}
