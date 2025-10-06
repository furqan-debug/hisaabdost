
import { useState, useEffect } from "react";
import { format, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useMonthContext } from "@/hooks/use-month-context";
import { useFamilyContext } from "@/hooks/useFamilyContext";

export const usePercentageChanges = (monthlyExpenses: number, monthlyIncome: number, savingsRate: number) => {
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
  const { activeFamilyId, isPersonalMode } = useFamilyContext();
  const [percentageChanges, setPercentageChanges] = useState({
    expenses: 0,
    income: 0,
    savings: 0
  });

  useEffect(() => {
    const fetchPreviousMonthData = async () => {
      if (!user) return;

      const previousMonth = subMonths(selectedMonth, 1);
      const prevMonthStart = format(previousMonth, 'yyyy-MM-01');
      const prevMonthEnd = format(previousMonth, 'yyyy-MM-dd');

      try {
        // Fetch previous month's expenses from the database
        let expenseQuery = supabase
          .from('expenses')
          .select('amount')
          .gte('date', prevMonthStart)
          .lte('date', prevMonthEnd);
        
        if (isPersonalMode) {
          expenseQuery = expenseQuery.eq('user_id', user.id).is('family_id', null);
        } else {
          expenseQuery = expenseQuery.eq('family_id', activeFamilyId);
        }
        
        const { data: prevExpenses } = await expenseQuery;

        // Calculate previous month's total expenses
        const prevMonthExpenses = prevExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
        
        // Fetch previous month's income from profiles or budgets
        const { data: incomeData } = await supabase
          .from('profiles')
          .select('monthly_income')
          .eq('id', user.id)
          .single();

        // Use the fetched previous month's income or fallback to current income
        // This is a fallback - ideally, we would store monthly income history
        const prevMonthIncome = incomeData?.monthly_income || monthlyIncome;
        
        // Calculate previous month's savings rate
        const prevSavingsRate = prevMonthIncome > 0 
          ? ((prevMonthIncome - prevMonthExpenses) / prevMonthIncome) * 100 
          : 0;

        // Calculate percentage changes between current and previous month
        let expensesChange = 0;
        let incomeChange = 0;
        let savingsChange = 0;
        
        // Only calculate percentage change if previous values exist
        if (prevMonthExpenses > 0) {
          expensesChange = ((monthlyExpenses - prevMonthExpenses) / prevMonthExpenses) * 100;
        }
        
        if (prevMonthIncome > 0) {
          incomeChange = ((monthlyIncome - prevMonthIncome) / prevMonthIncome) * 100;
        }
        
        if (prevSavingsRate > 0 || savingsRate > 0) {
          savingsChange = savingsRate - prevSavingsRate;
        }

        // Update state with calculated percentage changes
        setPercentageChanges({
          expenses: expensesChange,
          income: incomeChange,
          savings: savingsChange
        });
        
        console.log('Percentage changes:', {
          currentExpenses: monthlyExpenses,
          previousExpenses: prevMonthExpenses,
          expensesChange,
          currentIncome: monthlyIncome,
          previousIncome: prevMonthIncome,
          incomeChange,
          currentSavings: savingsRate,
          previousSavings: prevSavingsRate,
          savingsChange
        });
      } catch (error) {
        console.error("Error fetching previous month data:", error);
      }
    };

    fetchPreviousMonthData();
  }, [user, selectedMonth, monthlyExpenses, monthlyIncome, savingsRate, activeFamilyId, isPersonalMode]);

  return percentageChanges;
};
