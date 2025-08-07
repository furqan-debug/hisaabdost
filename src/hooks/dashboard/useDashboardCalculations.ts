
import { useWalletAdditions } from "@/hooks/useWalletAdditions";
import { Expense } from "@/components/expenses/types";
import { useEffect, useState } from "react";

interface DashboardCalculationsProps {
  expenses: Expense[];
  monthlyIncome: number;
}

export function useDashboardCalculations({ expenses, monthlyIncome }: DashboardCalculationsProps) {
  const { totalAdditions, walletAdditions, allWalletAdditions } = useWalletAdditions();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for wallet updates and force recalculation
  useEffect(() => {
    const handleWalletUpdate = () => {
      console.log('Dashboard calculations: Wallet update detected, forcing refresh');
      setRefreshTrigger(prev => prev + 1);
    };

    const eventTypes = ['wallet-updated', 'wallet-refresh'];
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleWalletUpdate);
    });

    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleWalletUpdate);
      });
    };
  }, []);

  // Calculate financial metrics (refresh when refreshTrigger changes)
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const walletBalance = monthlyIncome + totalAdditions - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Log calculations for debugging
  useEffect(() => {
    console.log('Dashboard calculations updated:', {
      monthlyIncome,
      totalAdditions,
      monthlyExpenses,
      walletBalance,
      walletAdditionsCount: walletAdditions?.length || 0,
      allWalletAdditionsCount: allWalletAdditions?.length || 0
    });
  }, [monthlyIncome, totalAdditions, monthlyExpenses, walletBalance, walletAdditions?.length, allWalletAdditions?.length, refreshTrigger]);

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  return {
    monthlyExpenses,
    totalBalance,
    walletBalance,
    totalAdditions,
    savingsRate,
    formatPercentage
  };
}
