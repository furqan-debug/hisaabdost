import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Expense } from "@/components/expenses/types";

export function useExpenseQueries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Main expenses query
  const {
    data: expenses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['all_expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("Fetching all expenses for user:", user.id);

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} expenses`);

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
      })) as Expense[];
    },
    enabled: !!user,
    staleTime: 1000 * 60,       // 1 minute
    cacheTime: 1000 * 300,      // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // Single coordinated refresh function
  const refreshExpenses = async () => {
    if (!user) return;
    console.log("Refreshing expenses data for user:", user.id);
    await queryClient.invalidateQueries({ queryKey: ['all_expenses', user.id] });
  };

  return {
    expenses,
    isLoading,
    error,
    refetch,
    refreshExpenses,
  };
}
