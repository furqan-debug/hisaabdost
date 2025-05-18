
import React from "react";
import { StatCards } from "@/components/dashboard/StatCards";

interface BalanceOverviewProps {
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  setMonthlyIncome: (income: number) => void;
}

export const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  formatPercentage,
  setMonthlyIncome
}) => {
  return (
    <StatCards
      totalBalance={totalBalance}
      monthlyExpenses={monthlyExpenses}
      monthlyIncome={monthlyIncome}
      setMonthlyIncome={setMonthlyIncome}
      savingsRate={savingsRate}
      formatPercentage={formatPercentage}
      isNewUser={false}
      walletBalance={totalBalance}
    />
  );
};
