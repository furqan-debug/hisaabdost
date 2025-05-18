
import React from "react";
import { StatCards } from "@/components/dashboard/StatCards";
import { WalletBalanceCard } from "@/components/dashboard/wallet/WalletBalanceCard";
import { CreditCard } from "lucide-react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";

interface BalanceOverviewProps {
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  setMonthlyIncome: (income: number) => void;
  isNewUser?: boolean;
  walletBalance: number;
}

export const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  formatPercentage,
  setMonthlyIncome,
  isNewUser = false,
  walletBalance
}) => {
  return (
    <div className="space-y-6">
      <OnboardingTooltip
        content="Track your wallet balance (Income + Added funds - Expenses)"
        defaultOpen={isNewUser}
      >
        <WalletBalanceCard 
          walletBalance={walletBalance} 
          icon={<CreditCard className="h-4 w-4 text-primary mb-1" />} 
        />
      </OnboardingTooltip>
      
      <StatCards
        totalBalance={totalBalance}
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        savingsRate={savingsRate}
        formatPercentage={formatPercentage}
        isNewUser={isNewUser}
        walletBalance={walletBalance}
      />
    </div>
  );
};
