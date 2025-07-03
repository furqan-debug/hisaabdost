
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Expense } from "@/components/expenses/types";

export function useExpenseQueries() {
  const { user } = useAuth();

  // Main expenses query - simplified with no overlapping invalidations
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
    gcTime: 1000 * 300,         // 5 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return {
    expenses,
    isLoading,
    error,
    refetch,
  };
}
