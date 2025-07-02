
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Expense } from "@/components/expenses/types";

export function useExpenseQueries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for expense update events with debouncing to prevent infinite loops
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const handleExpenseUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail || {};
      
      console.log(`Expense update event: ${event.type}`, detail);
      
      // Clear any existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Debounce the refresh to prevent infinite loops
      debounceTimer = setTimeout(() => {
        console.log(`Processing debounced refresh for ${event.type}`);
        setRefreshTrigger(Date.now());
        
        // Only invalidate queries, don't force refetch
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
        queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
        
        debounceTimer = null;
      }, 300); // 300ms debounce
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
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
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
