import { useCallback } from 'react';
import { format, startOfMonth, addMonths, isBefore, isSameMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useFamilyContext } from '@/hooks/useFamilyContext';

export function useCarryoverAdjustment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { activeFamilyId, isPersonalMode } = useFamilyContext();

  const adjustCarryover = useCallback(async (expenseMonth: Date) => {
    if (!user) return;

    const currentDate = new Date();
    const expenseMonthKey = format(expenseMonth, 'yyyy-MM');
    const nextMonth = addMonths(expenseMonth, 1);
    const nextMonthKey = format(nextMonth, 'yyyy-MM');
    
    // Only adjust if:
    // 1. The expense is in a past month (not current month)
    // 2. The next month has already occurred or is current month
    if (isSameMonth(expenseMonth, currentDate) || isBefore(currentDate, nextMonth)) {
      console.log('No carryover adjustment needed - expense is in current month or future');
      return;
    }

    console.log(`Checking carryover adjustment for ${expenseMonthKey} -> ${nextMonthKey}`);

    // Check if there's a carryover entry for the next month
    let carryoverQuery = supabase
      .from('wallet_additions')
      .select('*')
      .eq('fund_type', 'carryover')
      .eq('carryover_month', nextMonthKey)
      .eq('is_deleted_by_user', false);
    
    if (isPersonalMode) {
      carryoverQuery = carryoverQuery.eq('user_id', user.id).is('family_id', null);
    } else {
      carryoverQuery = carryoverQuery.eq('family_id', activeFamilyId);
    }
    
    const { data: existingCarryover, error: carryoverError } = await carryoverQuery.maybeSingle();

    if (carryoverError) {
      console.error('Error checking carryover:', carryoverError);
      return;
    }

    if (!existingCarryover) {
      console.log('No carryover exists for this month, no adjustment needed');
      return;
    }

    // Calculate the ACTUAL leftover for the expense month NOW
    // Get monthly income for the expense month
    let incomeQuery = supabase
      .from('monthly_incomes')
      .select('income_amount')
      .eq('month_year', expenseMonthKey);
    
    if (isPersonalMode) {
      incomeQuery = incomeQuery.eq('user_id', user.id).is('family_id', null);
    } else {
      incomeQuery = incomeQuery.eq('family_id', activeFamilyId);
    }
    
    const { data: incomeData, error: incomeError } = await incomeQuery.maybeSingle();

    if (incomeError || !incomeData) {
      console.error('Error fetching income data:', incomeError);
      return;
    }

    const monthlyIncome = incomeData.income_amount || 0;

    // Get all expenses for the expense month
    const firstDayOfMonth = format(startOfMonth(expenseMonth), 'yyyy-MM-dd');
    const lastDayOfMonth = format(new Date(expenseMonth.getFullYear(), expenseMonth.getMonth() + 1, 0), 'yyyy-MM-dd');

    let expenseQuery = supabase
      .from('expenses')
      .select('amount')
      .gte('date', firstDayOfMonth)
      .lte('date', lastDayOfMonth);
    
    if (isPersonalMode) {
      expenseQuery = expenseQuery.eq('user_id', user.id).is('family_id', null);
    } else {
      expenseQuery = expenseQuery.eq('family_id', activeFamilyId);
    }
    
    const { data: expenses, error: expensesError } = await expenseQuery;

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
      return;
    }

    const totalExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

    // Get wallet additions for the expense month (excluding carryover from previous month)
    let walletQuery = supabase
      .from('wallet_additions')
      .select('amount')
      .gte('date', firstDayOfMonth)
      .lte('date', lastDayOfMonth)
      .eq('is_deleted_by_user', false)
      .neq('carryover_month', expenseMonthKey); // Exclude carryover TO this month
    
    if (isPersonalMode) {
      walletQuery = walletQuery.eq('user_id', user.id).is('family_id', null);
    } else {
      walletQuery = walletQuery.eq('family_id', activeFamilyId);
    }
    
    const { data: walletAdditions, error: walletError } = await walletQuery;

    if (walletError) {
      console.error('Error fetching wallet additions:', walletError);
      return;
    }

    const totalWalletAdditions = walletAdditions?.reduce((sum, wa) => sum + Number(wa.amount), 0) || 0;

    // Calculate the CORRECT leftover balance
    const actualLeftover = monthlyIncome + totalWalletAdditions - totalExpenses;
    const currentCarryoverAmount = Number(existingCarryover.amount);
    const difference = actualLeftover - currentCarryoverAmount;

    console.log({
      expenseMonthKey,
      monthlyIncome,
      totalWalletAdditions,
      totalExpenses,
      actualLeftover,
      currentCarryoverAmount,
      difference
    });

    // If there's a significant difference (more than $0.01), update the carryover
    if (Math.abs(difference) > 0.01) {
      // Update the existing carryover entry with the correct amount
      const { error: updateError } = await supabase
        .from('wallet_additions')
        .update({
          amount: actualLeftover > 0 ? actualLeftover : 0,
          description: actualLeftover > 0 
            ? `Leftover balance from ${format(expenseMonth, 'MMMM yyyy')} (adjusted)`
            : `No carryover from ${format(expenseMonth, 'MMMM yyyy')}`
        })
        .eq('id', existingCarryover.id);

      if (updateError) {
        console.error('Error updating carryover:', updateError);
        toast({
          title: "Carryover Adjustment Failed",
          description: "Could not update the carryover amount. Please refresh the page.",
          variant: "destructive"
        });
        return;
      }

      // If the actual leftover is now 0 or negative, mark it as deleted
      if (actualLeftover <= 0) {
        await supabase
          .from('wallet_additions')
          .update({ is_deleted_by_user: true })
          .eq('id', existingCarryover.id);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_income'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });

      // Notify user about the adjustment
      const adjustmentType = difference > 0 ? 'increased' : 'decreased';
      const absAmount = Math.abs(difference).toFixed(2);
      
      toast({
        title: "Carryover Adjusted",
        description: `${format(nextMonth, 'MMMM yyyy')} balance ${adjustmentType} by $${absAmount} due to changes in ${format(expenseMonth, 'MMMM yyyy')}.`,
      });

      console.log(`✅ Carryover adjusted: ${currentCarryoverAmount} -> ${actualLeftover}`);
    } else {
      console.log('No significant difference, no adjustment needed');
    }
  }, [user, queryClient, activeFamilyId, isPersonalMode]);

  return { adjustCarryover };
}
