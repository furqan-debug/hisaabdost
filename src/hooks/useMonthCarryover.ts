import { useEffect, useRef } from 'react';
import { useMonthContext } from '@/hooks/use-month-context';
import { useWalletAdditions } from '@/hooks/useWalletAdditions';
import { useCarryoverPreferences } from '@/hooks/useCarryoverPreferences';
import { format, startOfMonth, subMonths, isAfter, isSameMonth } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

export function useMonthCarryover({ enabled = true }: { enabled?: boolean } = {}) {
  const { selectedMonth, monthsData } = useMonthContext();
  const { addFunds } = useWalletAdditions();
  const { preferences, isMonthProcessed, markMonthAsProcessed, checkCarryoverExists } = useCarryoverPreferences();
  
  // Use ref to track if we've already processed this month in this session
  const processedInSessionRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    
    const processCarryover = async () => {
      const currentMonthKey = format(selectedMonth, 'yyyy-MM');
      const currentDate = new Date();
      const currentMonthStart = startOfMonth(currentDate);
      
      console.log(`Checking carryover for month: ${currentMonthKey}`);
      
      // Only process carryover for current or future months
      if (!isAfter(selectedMonth, subMonths(currentDate, 1)) && !isSameMonth(selectedMonth, currentDate)) {
        console.log(`Skipping carryover for past month: ${currentMonthKey}`);
        return;
      }

      // Check if auto carryover is enabled
      if (preferences?.auto_carryover_enabled === false) {
        console.log('Auto carryover is disabled');
        return;
      }

      // Check if we've already processed this month in this session
      if (processedInSessionRef.current.has(currentMonthKey)) {
        console.log(`Month ${currentMonthKey} already processed in this session`);
        return;
      }

      // Check if we've already processed this month in the database
      if (isMonthProcessed(currentMonthKey)) {
        console.log(`Month ${currentMonthKey} already processed in database`);
        processedInSessionRef.current.add(currentMonthKey);
        return;
      }

      // Check if carryover funds already exist in the database for this month
      const carryoverExists = await checkCarryoverExists(currentMonthKey);
      if (carryoverExists) {
        console.log(`Carryover already exists for ${currentMonthKey}, marking as processed`);
        // Mark as processed without adding duplicate funds
        markMonthAsProcessed(currentMonthKey);
        processedInSessionRef.current.add(currentMonthKey);
        return;
      }

      // Only process carryover at the start of a new month
      // For current month, only process if we're in the first few days
      if (isSameMonth(selectedMonth, currentDate)) {
        const dayOfMonth = currentDate.getDate();
        if (dayOfMonth > 3) { // Only process in first 3 days of current month
          console.log(`Current month carryover skipped - day ${dayOfMonth} is beyond grace period`);
          return;
        }
      }

      const previousMonth = subMonths(selectedMonth, 1);
      const previousMonthKey = format(previousMonth, 'yyyy-MM');
      
      // Get previous month's data
      const previousMonthData = monthsData[previousMonthKey];
      
      // Only process if we have previous month data and it has meaningful values
      if (!previousMonthData || 
          !previousMonthData.monthlyIncome || 
          previousMonthData.monthlyIncome <= 0 ||
          typeof previousMonthData.monthlyExpenses !== 'number') {
        console.log('No valid previous month data for carryover');
        // Mark as processed even if no data to avoid repeated checks
        markMonthAsProcessed(currentMonthKey);
        processedInSessionRef.current.add(currentMonthKey);
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
        processedInSessionRef.current.add(currentMonthKey);
        
        // Show notification to user
        toast({
          title: "Balance Carried Over",
          description: `$${leftoverBalance.toFixed(2)} from ${format(previousMonth, 'MMMM yyyy')} has been added to your wallet.`,
        });
      } else {
        // Even if no carryover, mark as processed to avoid re-checking
        console.log(`No carryover needed for ${currentMonthKey}, marking as processed`);
        markMonthAsProcessed(currentMonthKey);
        processedInSessionRef.current.add(currentMonthKey);
      }
    };

    // Only run if preferences are loaded and user is authenticated
    // Add longer delay and debounce to prevent rapid re-execution
    if (preferences !== undefined) {
      const timeoutId = setTimeout(processCarryover, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedMonth, monthsData, preferences, addFunds, isMonthProcessed, markMonthAsProcessed, checkCarryoverExists, enabled]);

  // Clear session tracking when month changes
  useEffect(() => {
    const currentMonthKey = format(selectedMonth, 'yyyy-MM');
    // Keep session tracking for current month, but clear old months
    const keysToKeep = new Set([currentMonthKey]);
    processedInSessionRef.current = new Set([...processedInSessionRef.current].filter(key => keysToKeep.has(key)));
  }, [selectedMonth]);

  return null;
}
