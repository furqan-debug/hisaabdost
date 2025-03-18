
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/components/expenses/types";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { Skeleton } from "@/components/ui/skeleton";

// Import the component files
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { AddExpenseButton } from "@/components/dashboard/AddExpenseButton";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { ExpenseAnalyticsCard } from "@/components/dashboard/ExpenseAnalyticsCard";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedMonth, getCurrentMonthData, updateMonthData, isLoading: isMonthDataLoading } = useMonthContext();
  
  // Get current month's data from context
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const currentMonthData = getCurrentMonthData();
  
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Update local income state when selected month changes
  useEffect(() => {
    if (!isMonthDataLoading) {
      const data = getCurrentMonthData();
      setMonthlyIncome(data.monthlyIncome || 0);
    }
  }, [selectedMonth, getCurrentMonthData, isMonthDataLoading]);
  
  // Fetch expenses from Supabase using React Query, filtered by selected month
  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!user) return [];
      
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
  });

  // Calculate insights based on expenses
  const insights = useAnalyticsInsights(expenses);
  
  // Calculate financial metrics for the current month
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Update month data when income or expenses change
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
      <div className="space-y-6 animate-fade-in">
        <div className="h-14">
          <Skeleton className="h-8 w-1/3 skeleton-pulse" />
          <Skeleton className="h-4 w-1/2 mt-2 skeleton-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 skeleton-pulse" />
          ))}
        </div>
        <Skeleton className="h-36 skeleton-pulse" />
        <Skeleton className="h-64 skeleton-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader isNewUser={isNewUser} />
      
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

      <AddExpenseButton 
        isNewUser={isNewUser}
        expenseToEdit={expenseToEdit}
        showAddExpense={showAddExpense}
        setExpenseToEdit={setExpenseToEdit}
        setShowAddExpense={setShowAddExpense}
        onAddExpense={() => queryClient.invalidateQueries({ queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')] })}
      />

      <RecentExpensesCard 
        expenses={expenses}
        isNewUser={isNewUser}
        isLoading={isExpensesLoading}
        setExpenseToEdit={setExpenseToEdit}
        setShowAddExpense={setShowAddExpense}
      />

      <ExpenseAnalyticsCard 
        expenses={expenses}
        isLoading={isExpensesLoading}
        chartType={chartType}
        setChartType={setChartType}
      />
    </div>
  );
};

export default Dashboard;
