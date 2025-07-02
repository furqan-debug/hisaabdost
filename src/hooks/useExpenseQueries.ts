
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Expense } from "@/components/expenses/types";

export function useExpenseQueries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for expense update events with proper debouncing
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
        setRefreshTrigger(prev => prev + 1);
        
        // Only invalidate queries, don't force refetch to prevent loops
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
        queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
        
        debounceTimer = null;
      }, 500); // Increased debounce time to 500ms
    };

    // Only listen to the most essential events
    const eventTypes = [
      'expense-updated',
      'expense-added', 
      'expense-deleted',
      'finny-expense-added'
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
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Prevent excessive refetching
  });

  return {
    expenses,
    isLoading,
    error,
    refetch,
    refreshTrigger
  };
}
