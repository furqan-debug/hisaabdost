
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Expense } from "@/components/expenses/types";

export function useExpenseQueries() {
  const { user } = useAuth();

  // Simplified expenses query with better performance
  const {
    data: expenses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log("Fetching expenses for user:", user.id);

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
    staleTime: 1000 * 60 * 2,     // 2 minutes for mobile optimization
    gcTime: 1000 * 60 * 10,       // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,     // Only refetch on reconnect
    refetchOnMount: false,        // Only fetch if data is stale
  });

  return {
    expenses,
    isLoading,
    error,
    refetch,
  };
}
