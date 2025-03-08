
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { format } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";

export function useBudgetData() {
  const { selectedMonth, getCurrentMonthData, isLoading: isMonthDataLoading } = useMonthContext();
  const currentMonthData = getCurrentMonthData();

  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');

      if (error) throw error;
      return data;
    },
  });

  const exportBudgetData = () => {
    if (!budgets) return;

    const csvContent = [
      ['Category', 'Amount', 'Period', 'Carry Forward', 'Created At'].join(','),
      ...budgets.map(budget => [
        budget.category,
        budget.amount,
        budget.period,
        budget.carry_forward,
        format(new Date(budget.created_at), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Calculate summary data using the current month's data
  const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
  const totalSpent = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  const remainingBalance = totalBudget - totalSpent;
  const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const monthlyIncome = currentMonthData.monthlyIncome || 0;

  return {
    budgets,
    expenses,
    isLoading: budgetsLoading || expensesLoading || isMonthDataLoading,
    exportBudgetData,
    totalBudget,
    totalSpent,
    remainingBalance,
    usagePercentage,
    monthlyIncome,
  };
}
