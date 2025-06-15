import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/components/expenses/types";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useExpenseRefresh } from "@/hooks/useExpenseRefresh";
import { useWalletAdditions } from "@/hooks/useWalletAdditions";
import { useMonthCarryover } from "@/hooks/useMonthCarryover";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";

export function useDashboardData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { selectedMonth, getCurrentMonthData, updateMonthData } = useMonthContext();
  const { refreshTrigger } = useExpenseRefresh();
  const { totalAdditions } = useWalletAdditions();
  
  // Initialize month carryover functionality
  useMonthCarryover();
  
  // Get current month's data from context
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const currentMonthData = getCurrentMonthData();
  
  const [monthlyIncome, setMonthlyIncome] = useState<number>(currentMonthData.monthlyIncome || 0);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Fetch monthly income from Supabase - checking both budgets and profiles
  const { data: incomeData, isLoading: isIncomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      try {
        // First check budgets table for monthly income
        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .select('monthly_income')
          .eq('user_id', user.id)
          .limit(1);
          
        if (budgetError) throw budgetError;
        
        // If we have income data in budgets, use that
        if (budgetData && budgetData.length > 0 && budgetData[0].monthly_income) {
          return { monthlyIncome: budgetData[0].monthly_income };
        }
        
        // Otherwise, check the profiles table for monthly income
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('monthly_income')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          // If there's an error getting the profile, but it's not critical
          console.warn("Could not fetch profile data:", profileError);
          return { monthlyIncome: 0 };
        }
        
        // Return income from profile if available
        return { 
          monthlyIncome: profileData?.monthly_income || 0 
        };
      } catch (error) {
        console.error("Error fetching monthly income:", error);
        return { monthlyIncome: 0 };
      }
    },
    enabled: !!user,
  });
  
  // Update local income state when data is fetched from Supabase
  useEffect(() => {
    if (incomeData && !isIncomeLoading) {
      setMonthlyIncome(incomeData.monthlyIncome);
      
      // Also update the month context
      updateMonthData(currentMonthKey, {
        monthlyIncome: incomeData.monthlyIncome
      });
    }
  }, [incomeData, isIncomeLoading, updateMonthData, currentMonthKey]);
  
  // Handle manual expense refreshing
  const handleExpenseRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')] });
    queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
  };
  
  // Fetch current month's expenses from Supabase using React Query
  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses', format(selectedMonth, 'yyyy-MM'), refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching expenses for month:", format(selectedMonth, 'yyyy-MM'));
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      
      console.log(`Fetched ${data.length} expenses for the month`);
      
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
  });

  // Fetch ALL expenses for the last 6 months for spending trends
  const { data: allExpenses = [] } = useQuery({
    queryKey: ['all_expenses', refreshTrigger, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching all expenses for spending trends");
      
      // Get expenses from 6 months ago to now
      const sixMonthsAgo = subMonths(new Date(), 5);
      const startDate = startOfMonth(sixMonthsAgo);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching all expenses:', error);
        return [];
      }
      
      console.log(`Fetched ${data.length} total expenses for spending trends`);
      
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
  });

  // Calculate financial metrics for the current month
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const walletBalance = monthlyIncome + totalAdditions - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Setup notification triggers with enhanced alerts
  useNotificationTriggers({
    budgets: [], // Will be populated when budget data is available
    monthlyExpenses,
    monthlyIncome,
    walletBalance,
    expenses, // Add expenses for more detailed notifications
    previousMonthExpenses: 0, // Could be enhanced to fetch actual previous month data
  });

  // Update month data when income or expenses change
  useEffect(() => {
    updateMonthData(currentMonthKey, {
      monthlyIncome,
      monthlyExpenses,
      totalBalance,
      walletBalance,
      savingsRate
    });
  }, [monthlyIncome, monthlyExpenses, totalAdditions, currentMonthKey, updateMonthData]);

  // Listen for expense update events and refresh data
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Refresh trigger changed, invalidating expense queries");
      queryClient.invalidateQueries({ queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')] });
      queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
    }
  }, [refreshTrigger, queryClient, selectedMonth]);

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  const isNewUser = expenses.length === 0;
  const isLoading = isExpensesLoading || isIncomeLoading;

  return {
    expenses,
    allExpenses, // Add all expenses for spending trends
    isExpensesLoading,
    isLoading,
    isNewUser,
    monthlyIncome,
    monthlyExpenses,
    totalBalance,
    walletBalance,
    totalAdditions,
    savingsRate,
    chartType,
    setChartType,
    expenseToEdit,
    setExpenseToEdit,
    showAddExpense,
    setShowAddExpense,
    handleExpenseRefresh,
    formatPercentage,
    setMonthlyIncome
  };
}
