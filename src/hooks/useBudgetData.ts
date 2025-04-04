
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useMonthContext } from '@/hooks/use-month-context';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Budget } from '@/pages/Budget';

export const useBudgetData = () => {
  const { user } = useAuth();
  const { selectedMonth, getCurrentMonthData, updateMonthData } = useMonthContext();
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(
    getCurrentMonthData().monthlyIncome || 0
  );

  // Query for fetching budget data
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', currentMonthKey, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching budgets for user:", user.id, "and month:", currentMonthKey);
      
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        return data as Budget[];
      } catch (error) {
        console.error("Error fetching budgets:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Calculate budget metrics
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  
  // Total spent calculation (placeholder - implement your own logic here)
  const totalSpent = 0; // You would calculate this based on actual expenses
  
  const remainingBalance = totalBudget - totalSpent;
  const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Export budget data as CSV
  const exportBudgetData = () => {
    // Implement export functionality as needed
    console.log("Exporting budget data");
  };

  // Update monthly income
  const updateMonthlyIncome = async (income: number) => {
    try {
      setMonthlyIncome(income);
      
      // Store in Supabase if needed
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            monthly_income: income,
            month_key: currentMonthKey
          });
          
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error updating monthly income:", error);
      return false;
    }
  };

  useEffect(() => {
    // Initialize or update monthly income from context data
    const storedIncome = getCurrentMonthData().monthlyIncome;
    if (storedIncome !== undefined && storedIncome !== monthlyIncome) {
      setMonthlyIncome(storedIncome);
    }
  }, [getCurrentMonthData, currentMonthKey]);

  return {
    budgets,
    isLoading,
    exportBudgetData,
    totalBudget,
    totalSpent,
    remainingBalance,
    usagePercentage,
    monthlyIncome,
    updateMonthlyIncome
  };
};
