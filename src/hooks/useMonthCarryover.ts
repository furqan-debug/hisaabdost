
import { useEffect, useRef } from 'react';
import { useMonthContext } from '@/hooks/use-month-context';
import { useWalletAdditions } from '@/hooks/useWalletAdditions';
import { format, startOfMonth, subMonths, isSameMonth } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

export function useMonthCarryover() {
  const { selectedMonth, monthsData, updateMonthData } = useMonthContext();
  const { addFunds } = useWalletAdditions();
  const processedMonthsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentMonthKey = format(selectedMonth, 'yyyy-MM');
    const previousMonth = subMonths(selectedMonth, 1);
    const previousMonthKey = format(previousMonth, 'yyyy-MM');
    
    // Check if we've already processed this month transition
    if (processedMonthsRef.current.has(currentMonthKey)) {
      return;
    }

    // Get previous month's data
    const previousMonthData = monthsData[previousMonthKey];
    
    // Only process if we have previous month data and it has meaningful values
    if (!previousMonthData || 
        !previousMonthData.monthlyIncome || 
        previousMonthData.monthlyIncome <= 0 ||
        typeof previousMonthData.monthlyExpenses !== 'number') {
      return;
    }

    // Calculate leftover balance from previous month
    const leftoverBalance = previousMonthData.monthlyIncome - (previousMonthData.monthlyExpenses || 0);
    
    // Only carryover if there's a positive leftover balance
    if (leftoverBalance > 0) {
      console.log(`Carrying over ${leftoverBalance} from ${previousMonthKey} to ${currentMonthKey}`);
      
      // Add the leftover balance to wallet
      addFunds({
        amount: leftoverBalance,
        description: `Leftover balance from ${format(previousMonth, 'MMMM yyyy')}`,
        date: format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
      });

      // Mark this month as processed
      processedMonthsRef.current.add(currentMonthKey);
      
      // Show notification to user
      toast({
        title: "Balance Carried Over",
        description: `${leftoverBalance.toFixed(2)} from ${format(previousMonth, 'MMMM yyyy')} has been added to your wallet.`,
      });
    }
  }, [selectedMonth, monthsData, addFunds]);

  return null;
}
