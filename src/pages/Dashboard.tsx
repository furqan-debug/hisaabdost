
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expense } from "@/components/AddExpenseSheet";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useExpenseFilter } from "@/hooks/use-expense-filter";

// Import the components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { AddExpenseButton } from "@/components/dashboard/AddExpenseButton";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { ExpenseAnalyticsCard } from "@/components/dashboard/ExpenseAnalyticsCard";

interface DashboardProps {
  selectedMonth: Date;
}

const Dashboard = ({ selectedMonth }: DashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => {
    const saved = localStorage.getItem('monthlyIncome');
    return saved ? Number(saved) : 0;
  });
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Fetch expenses from Supabase using React Query
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
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

  // Use the expense filter hook to filter expenses by the selected month
  const { filteredExpenses } = useExpenseFilter(expenses, selectedMonth);

  // Calculate insights based on filtered expenses
  const insights = useAnalyticsInsights(filteredExpenses);
  
  const monthlyExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  useEffect(() => {
    localStorage.setItem('monthlyIncome', monthlyIncome.toString());
  }, [monthlyIncome]);

  const isNewUser = expenses.length === 0;
  const currentMonthLabel = format(selectedMonth, "MMMM yyyy");

  return (
    <div className="space-y-6">
      <DashboardHeader 
        isNewUser={isNewUser} 
        currentMonth={currentMonthLabel}
      />
      
      <StatCards 
        totalBalance={totalBalance}
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        savingsRate={savingsRate}
        formatPercentage={formatPercentage}
        isNewUser={isNewUser}
      />

      <AddExpenseButton 
        isNewUser={isNewUser}
        expenseToEdit={expenseToEdit}
        showAddExpense={showAddExpense}
        setExpenseToEdit={setExpenseToEdit}
        setShowAddExpense={setShowAddExpense}
        onAddExpense={() => queryClient.invalidateQueries({ queryKey: ['expenses'] })}
      />

      <RecentExpensesCard 
        expenses={filteredExpenses}
        isNewUser={isNewUser}
        isLoading={isLoading}
        setExpenseToEdit={setExpenseToEdit}
        setShowAddExpense={setShowAddExpense}
        currentMonth={currentMonthLabel}
      />

      <ExpenseAnalyticsCard 
        expenses={filteredExpenses}
        isLoading={isLoading}
        chartType={chartType}
        setChartType={setChartType}
      />
    </div>
  );
};

export default Dashboard;
