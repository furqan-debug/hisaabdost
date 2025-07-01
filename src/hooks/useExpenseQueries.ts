
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Expense } from "@/components/expenses/types";

export function useExpenseQueries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for expense update events
  useEffect(() => {
    const handleExpenseUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail || {};
      
      console.log(`Expense update event: ${event.type}`, detail);
      
      // Force immediate refresh
      setRefreshTrigger(Date.now());
      
      // Invalidate all expense-related queries
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
      
      // Force immediate refetch with delay to ensure database write is complete
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['expenses'] });
        queryClient.refetchQueries({ queryKey: ['all_expenses'] });
        queryClient.refetchQueries({ queryKey: ['all-expenses'] });
      }, 100);
      
      // Additional delayed refetch for Finny actions
      if (detail.source === 'finny-chat') {
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['expenses'] });
          queryClient.refetchQueries({ queryKey: ['all_expenses'] });
          queryClient.refetchQueries({ queryKey: ['all-expenses'] });
        }, 1000);
      }
    };

    const eventTypes = [
      'expense-added',
      'expense-updated',
      'expense-deleted',
      'expenses-updated',
      'expense-refresh',
      'finny-expense-added',
      'dashboard-refresh'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleExpenseUpdate);
    });

    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleExpenseUpdate);
      });
    };
  }, [queryClient]);

  // Main expenses query
  const { data: expenses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['all_expenses', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching all expenses for user:", user.id, "trigger:", refreshTrigger);
      
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
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    expenses,
    isLoading,
    error,
    refetch,
    refreshTrigger
  };
}
