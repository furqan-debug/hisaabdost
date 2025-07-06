
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedFinancialSummary } from "./stats/UnifiedFinancialSummary";

interface StatCardsProps {
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  isNewUser: boolean;
  isLoading?: boolean;
  walletBalance: number;
}

export const StatCards = ({
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  setMonthlyIncome,
  savingsRate,
  formatPercentage,
  isNewUser,
  isLoading = false,
  walletBalance,
}: StatCardsProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <OnboardingTooltip
        content="Your complete financial overview with easy access to add funds and edit income"
        defaultOpen={isNewUser}
      >
        <UnifiedFinancialSummary
          walletBalance={walletBalance}
          monthlyExpenses={monthlyExpenses}
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={setMonthlyIncome}
          savingsRate={savingsRate}
          formatPercentage={formatPercentage}
          isNewUser={isNewUser}
        />
      </OnboardingTooltip>
    </div>
  );
};
