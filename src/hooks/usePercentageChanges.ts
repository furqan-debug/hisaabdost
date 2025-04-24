
import { useState, useEffect } from "react";
import { format, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useMonthContext } from "@/hooks/use-month-context";

export const usePercentageChanges = (monthlyExpenses: number, monthlyIncome: number, savingsRate: number) => {
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
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
        const { data: prevExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', prevMonthStart)
          .lte('date', prevMonthEnd);

        const prevMonthExpenses = prevExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
        const prevMonthIncome = monthlyIncome;
        const prevSavingsRate = prevMonthIncome > 0 
          ? ((prevMonthIncome - prevMonthExpenses) / prevMonthIncome) * 100 
          : 0;

        const expensesChange = prevMonthExpenses > 0 
          ? ((monthlyExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 
          : 0;
        const incomeChange = prevMonthIncome > 0 
          ? ((monthlyIncome - prevMonthIncome) / prevMonthIncome) * 100 
          : 0;
        const savingsChange = prevSavingsRate > 0 
          ? (savingsRate - prevSavingsRate) 
          : 0;

        setPercentageChanges({
          expenses: expensesChange,
          income: incomeChange,
          savings: savingsChange
        });
      } catch (error) {
        console.error("Error fetching previous month data:", error);
      }
    };

    fetchPreviousMonthData();
  }, [user, selectedMonth, monthlyExpenses, monthlyIncome, savingsRate]);

  return percentageChanges;
};
