
import { useEffect } from 'react';
import { useMonthContext } from '@/hooks/use-month-context';
import { useWalletAdditions } from '@/hooks/useWalletAdditions';
import { useCarryoverPreferences } from '@/hooks/useCarryoverPreferences';
import { format, startOfMonth, subMonths } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

export function useMonthCarryover() {
  const { selectedMonth, monthsData } = useMonthContext();
  const { addFunds } = useWalletAdditions();
  const { preferences, isMonthProcessed, markMonthAsProcessed, checkCarryoverExists } = useCarryoverPreferences();

  useEffect(() => {
    const processCarryover = async () => {
      const currentMonthKey = format(selectedMonth, 'yyyy-MM');
      const previousMonth = subMonths(selectedMonth, 1);
      const previousMonthKey = format(previousMonth, 'yyyy-MM');
      
      console.log(`Processing carryover for month: ${currentMonthKey}`);
      
      // Check if auto carryover is enabled
      if (preferences?.auto_carryover_enabled === false) {
        console.log('Auto carryover is disabled');
        return;
      }

      // Check if we've already processed this month
      if (isMonthProcessed(currentMonthKey)) {
        console.log(`Month ${currentMonthKey} already processed`);
        return;
      }

      // Check if carryover funds already exist in the database for this month
      const carryoverExists = await checkCarryoverExists(currentMonthKey);
      if (carryoverExists) {
        console.log(`Carryover already exists for ${currentMonthKey}, marking as processed`);
        // Mark as processed without adding duplicate funds
        markMonthAsProcessed(currentMonthKey);
        return;
      }

      // Get previous month's data
      const previousMonthData = monthsData[previousMonthKey];
      
      // Only process if we have previous month data and it has meaningful values
      if (!previousMonthData || 
          !previousMonthData.monthlyIncome || 
          previousMonthData.monthlyIncome <= 0 ||
          typeof previousMonthData.monthlyExpenses !== 'number') {
        console.log('No valid previous month data for carryover');
        return;
      }

      // Calculate leftover balance from previous month
      const leftoverBalance = previousMonthData.monthlyIncome - (previousMonthData.monthlyExpenses || 0);
      
      // Only carryover if there's a positive leftover balance (min $1 to avoid tiny amounts)
      if (leftoverBalance > 1) {
        console.log(`Carrying over ${leftoverBalance} from ${previousMonthKey} to ${currentMonthKey}`);
        
        // Add the leftover balance to wallet with carryover metadata
        addFunds({
          amount: leftoverBalance,
          description: `Leftover balance from ${format(previousMonth, 'MMMM yyyy')}`,
          date: format(startOfMonth(selectedMonth), 'yyyy-MM-dd'),
          fund_type: 'carryover',
          carryover_month: currentMonthKey,
        });

        // Mark this month as processed
        markMonthAsProcessed(currentMonthKey);
        
        // Show notification to user
        toast({
          title: "Balance Carried Over",
          description: `$${leftoverBalance.toFixed(2)} from ${format(previousMonth, 'MMMM yyyy')} has been added to your wallet.`,
        });
      } else {
        // Even if no carryover, mark as processed to avoid re-checking
        console.log(`No carryover needed for ${currentMonthKey}, marking as processed`);
        markMonthAsProcessed(currentMonthKey);
      }
    };

    // Only run if preferences are loaded and user is authenticated
    // Add a small delay to prevent rapid re-execution
    if (preferences !== undefined) {
      const timeoutId = setTimeout(processCarryover, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedMonth, monthsData, preferences, addFunds, isMonthProcessed, markMonthAsProcessed, checkCarryoverExists]);

  return null;
}
