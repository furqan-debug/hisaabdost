import { useState, useEffect, useCallback } from "react";
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
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedMonth, getCurrentMonthData, updateMonthData, isLoading: isMonthDataLoading } = useMonthContext();
  const { refreshTrigger } = useExpenseRefresh();
  
  // Get current month's data from context (memoized to prevent unnecessary renders)
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const currentMonthData = useCallback(() => getCurrentMonthData(), [currentMonthKey, getCurrentMonthData]);
  
  // Initialize with context data
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    const data = getCurrentMonthData();
    return data.monthlyIncome || 0;
  });
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Update local income state when selected month changes (once, not continuously)
  useEffect(() => {
    if (!isMonthDataLoading) {
      const data = getCurrentMonthData();
      setMonthlyIncome(data.monthlyIncome || 0);
    }
  }, [selectedMonth, getCurrentMonthData, isMonthDataLoading]);
  
  // Fetch expenses from Supabase using React Query, but with better caching and fewer refreshes
  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses', currentMonthKey, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching expenses for month:", currentMonthKey);
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
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
    },
    enabled: !!user,
    staleTime: 30000, // Increase stale time to prevent frequent refetches
    refetchOnWindowFocus: false // Disable refetch on window focus
  });

  // Insights and calculations - memoize calculations to prevent unnecessary re-renders
  const insights = useAnalyticsInsights(expenses);
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Update month data when income or expenses change, but with proper dependency checks
  useEffect(() => {
    if (!isMonthDataLoading) {
      updateMonthData(currentMonthKey, {
        monthlyIncome,
        monthlyExpenses,
        totalBalance,
        savingsRate
      });
    }
  }, [monthlyIncome, monthlyExpenses, currentMonthKey, updateMonthData, isMonthDataLoading]);

  // Simplified animation variants to reduce rendering load
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  };

  // Helper functions
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  const isNewUser = expenses.length === 0;
  const isLoading = isMonthDataLoading || isExpensesLoading;

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
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <DashboardHeader isNewUser={isNewUser} />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <StatCards 
          totalBalance={totalBalance}
          monthlyExpenses={monthlyExpenses}
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={setMonthlyIncome}
          savingsRate={savingsRate}
          formatPercentage={formatPercentage}
          isNewUser={isNewUser}
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <AddExpenseButton 
          isNewUser={isNewUser}
          expenseToEdit={expenseToEdit}
          showAddExpense={showAddExpense}
          setExpenseToEdit={setExpenseToEdit}
          setShowAddExpense={setShowAddExpense}
          onAddExpense={() => queryClient.invalidateQueries({ queryKey: ['expenses', currentMonthKey] })}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <RecentExpensesCard 
          expenses={expenses}
          isNewUser={isNewUser}
          isLoading={isExpensesLoading}
          setExpenseToEdit={setExpenseToEdit}
          setShowAddExpense={setShowAddExpense}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ExpenseAnalyticsCard 
          expenses={expenses}
          isLoading={isExpensesLoading}
          chartType={chartType}
          setChartType={setChartType}
        />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
