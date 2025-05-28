
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMonthContext } from "@/hooks/use-month-context";
import { useCurrency } from "@/hooks/use-currency";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "./stats/StatCard";
import { EditableIncomeCard } from "./stats/EditableIncomeCard";
import { usePercentageChanges } from "@/hooks/usePercentageChanges";
import { formatCurrency } from "@/utils/formatters";
import { WalletBalanceCard } from "./wallet/WalletBalanceCard";
import { PercentageChange } from "./stats/PercentageChange";

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
  const { currencyCode } = useCurrency();
  const { selectedMonth } = useMonthContext();
  
  // Get percentage changes from the hook
  const percentageChanges = usePercentageChanges(monthlyExpenses, monthlyIncome, savingsRate);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[150px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
      <OnboardingTooltip
        content="Track your wallet balance including income and added funds"
        defaultOpen={isNewUser}
      >
        <WalletBalanceCard walletBalance={walletBalance} />
      </OnboardingTooltip>
      
      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(monthlyExpenses, currencyCode)}
        subtext={<PercentageChange value={percentageChanges.expenses} inverse={true} />}
        infoTooltip="Total amount spent this month across all categories and payment methods"
      />

      <EditableIncomeCard
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        percentageChange={percentageChanges.income}
        formatCurrency={formatCurrency}
        currencyCode={currencyCode}
        className=""
        infoTooltip="Your monthly income before taxes. Click 'Edit Income' to update this amount"
      />

      <StatCard
        title="Savings Rate"
        value={formatPercentage(savingsRate)}
        subtext={<PercentageChange value={percentageChanges.savings} />}
        infoTooltip="Percentage of income saved this month. Calculated as (Income - Expenses) / Income"
      />
    </div>
  );
};
