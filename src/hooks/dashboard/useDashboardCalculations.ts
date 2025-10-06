import { useWalletAdditions } from "@/hooks/useWalletAdditions";
import { Expense } from "@/components/expenses/types";

interface DashboardCalculationsProps {
  expenses: Expense[];
  monthlyIncome: number;
  selectedMonth?: Date;
}

export function useDashboardCalculations({ expenses, monthlyIncome, selectedMonth }: DashboardCalculationsProps) {
  const { totalAdditions, isLoading } = useWalletAdditions(selectedMonth);

  // Calculate financial metrics
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const walletBalance = monthlyIncome + totalAdditions - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

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
    formatPercentage,
    isLoadingWallet: isLoading
  };
}
