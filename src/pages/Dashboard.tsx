
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/components/expenses/types";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpenseRefresh } from "@/hooks/useExpenseRefresh";

// Import the component files
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { AddExpenseButton } from "@/components/dashboard/AddExpenseButton";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { ExpenseAnalyticsCard } from "@/components/dashboard/ExpenseAnalyticsCard";

// Memoize expensive components
const MemoizedRecentExpensesCard = memo(RecentExpensesCard);
const MemoizedExpenseAnalyticsCard = memo(ExpenseAnalyticsCard);

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedMonth, getCurrentMonthData, updateMonthData, isLoading: isMonthDataLoading } = useMonthContext();
  const { refreshTrigger } = useExpenseRefresh();
  
  // Prevent excessive renders with refs
  const selectedMonthRef = useRef(selectedMonth);
  const refreshTriggerRef = useRef(refreshTrigger);
  
  // Get current month's data from context
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  
  // Initialize with context data
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    const data = getCurrentMonthData();
    return data.monthlyIncome || 0;
  });
  
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Use refs to track previous values to prevent unnecessary updates
  const prevMonthlyIncomeRef = useRef(monthlyIncome);
  
  // Update local income state when selected month changes - only if different
  useEffect(() => {
    if (!isMonthDataLoading && selectedMonth !== selectedMonthRef.current) {
      selectedMonthRef.current = selectedMonth;
      const data = getCurrentMonthData();
      if (data.monthlyIncome !== prevMonthlyIncomeRef.current) {
        setMonthlyIncome(data.monthlyIncome || 0);
        prevMonthlyIncomeRef.current = data.monthlyIncome || 0;
      }
    }
  }, [selectedMonth, getCurrentMonthData, isMonthDataLoading]);
  
  // Update refresh trigger ref
  useEffect(() => {
    refreshTriggerRef.current = refreshTrigger;
  }, [refreshTrigger]);
  
  // Memoize query function to prevent recreations
  const fetchExpenses = useCallback(async () => {
    if (!user) return [];
    
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again.",
          variant: "destructive",
        });
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
    } catch (err) {
      console.error('Unexpected error fetching expenses:', err);
      return [];
    }
  }, [user, selectedMonth, toast]);
  
  // Fetch expenses with highly optimized React Query settings
  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses', currentMonthKey, refreshTrigger],
    queryFn: fetchExpenses,
    enabled: !!user,
    staleTime: 300000, // 5 minutes - prevent frequent refetches
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false, 
    retry: false,
  });

  // Update refs to prevent calculation loops
  const expensesRef = useRef(expenses);
  useEffect(() => {
    expensesRef.current = expenses;
  }, [expenses]);
  
  // Insights and calculations
  const insights = useAnalyticsInsights(expenses);
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Debounce context updates to prevent render loops
  const updateContextTimer = useRef<number | null>(null);
  
  // Update month data when income or expenses change - with debouncing
  useEffect(() => {
    if (isMonthDataLoading) return;
    
    // Clear any existing timeout
    if (updateContextTimer.current) {
      window.clearTimeout(updateContextTimer.current);
    }
    
    // Debounce updates to context
    updateContextTimer.current = window.setTimeout(() => {
      updateMonthData(currentMonthKey, {
        monthlyIncome,
        monthlyExpenses,
        totalBalance,
        savingsRate
      });
      updateContextTimer.current = null;
    }, 500); // Half-second debounce
    
    return () => {
      if (updateContextTimer.current) {
        window.clearTimeout(updateContextTimer.current);
      }
    };
  }, [
    monthlyIncome, 
    monthlyExpenses,
    currentMonthKey, 
    updateMonthData, 
    isMonthDataLoading,
    totalBalance,
    savingsRate
  ]);

  // Memoize formatting function
  const formatPercentage = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  }, []);

  const isNewUser = expenses.length === 0;
  const isLoading = isMonthDataLoading || isExpensesLoading;

  // Handle monthly income changes
  const handleMonthlyIncomeChange = useCallback((newIncome: number) => {
    setMonthlyIncome(prevIncome => {
      // Only update if value has actually changed
      if (prevIncome !== newIncome) {
        prevMonthlyIncomeRef.current = newIncome;
        return newIncome;
      }
      return prevIncome;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-14">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 dashboard-container">
      <DashboardHeader isNewUser={isNewUser} />
      
      <StatCards 
        totalBalance={totalBalance}
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={handleMonthlyIncomeChange}
        savingsRate={savingsRate}
        formatPercentage={formatPercentage}
        isNewUser={isNewUser}
        isLoading={isLoading}
      />

      <AddExpenseButton 
        isNewUser={isNewUser}
        expenseToEdit={expenseToEdit}
        showAddExpense={showAddExpense}
        setExpenseToEdit={setExpenseToEdit}
        setShowAddExpense={setShowAddExpense}
        onAddExpense={() => queryClient.invalidateQueries({ queryKey: ['expenses', currentMonthKey] })}
      />

      <MemoizedRecentExpensesCard 
        expenses={expenses}
        isNewUser={isNewUser}
        isLoading={isExpensesLoading}
        setExpenseToEdit={setExpenseToEdit}
        setShowAddExpense={setShowAddExpense}
      />

      <MemoizedExpenseAnalyticsCard 
        expenses={expenses}
        isLoading={isExpensesLoading}
        chartType={chartType}
        setChartType={setChartType}
      />
    </div>
  );
};

export default Dashboard;
