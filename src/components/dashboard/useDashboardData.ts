
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/components/expenses/types";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useExpenseRefresh } from "@/hooks/useExpenseRefresh";

export function useDashboardData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { selectedMonth, getCurrentMonthData, updateMonthData } = useMonthContext();
  const { refreshTrigger } = useExpenseRefresh();
  
  // Get current month's data from context
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const currentMonthData = getCurrentMonthData();
  
  const [monthlyIncome, setMonthlyIncome] = useState<number>(currentMonthData.monthlyIncome || 0);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Fetch monthly income from Supabase
  const { data: incomeData, isLoading: isIncomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('monthly_income')
          .eq('user_id', user.id)
          .limit(1);
          
        if (error) throw error;
        return { monthlyIncome: data?.[0]?.monthly_income || 0 };
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
  };
  
  // Fetch expenses from Supabase using React Query, filtered by selected month
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

  // Calculate financial metrics for the current month
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Update month data when income or expenses change
  useEffect(() => {
    updateMonthData(currentMonthKey, {
      monthlyIncome,
      monthlyExpenses,
      totalBalance,
      savingsRate
    });
  }, [monthlyIncome, monthlyExpenses, currentMonthKey, updateMonthData]);

  // Listen for expense update events and refresh data
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Refresh trigger changed, invalidating expense queries");
      queryClient.invalidateQueries({ queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')] });
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
    isExpensesLoading,
    isLoading,
    isNewUser,
    monthlyIncome,
    monthlyExpenses,
    totalBalance,
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
