
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
import { MonthlyIncomeService } from "@/services/monthlyIncomeService";

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
  
  // Fetch monthly income using the new service
  const { data: incomeData, isLoading: isIncomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id, currentMonthKey],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      console.log("Fetching monthly income for:", user.id, currentMonthKey);
      const income = await MonthlyIncomeService.getMonthlyIncome(user.id, selectedMonth);
      return { monthlyIncome: income };
    },
    enabled: !!user,
  });
  
  // Update local income state when data is fetched
  useEffect(() => {
    if (incomeData && !isIncomeLoading) {
      console.log("Updating monthly income state:", incomeData.monthlyIncome);
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
  
  // Listen for income update events from Finny
  useEffect(() => {
    const handleIncomeUpdate = () => {
      console.log("Income update event received, refreshing data");
      queryClient.invalidateQueries({ queryKey: ['monthly_income', user?.id, currentMonthKey] });
    };

    window.addEventListener('income-updated', handleIncomeUpdate);
    return () => window.removeEventListener('income-updated', handleIncomeUpdate);
  }, [queryClient, user?.id, currentMonthKey]);
  
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
    setMonthlyIncome: async (newIncome: number) => {
      if (user) {
        const success = await MonthlyIncomeService.setMonthlyIncome(user.id, selectedMonth, newIncome);
        if (success) {
          setMonthlyIncome(newIncome);
        }
      }
    }
  };
}
