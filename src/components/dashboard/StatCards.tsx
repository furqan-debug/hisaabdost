
import React from "react";
import { DollarSign, Wallet, ArrowUpRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMonthContext } from "@/hooks/use-month-context";
import { useCurrency } from "@/hooks/use-currency";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "./stats/StatCard";
import { PercentageChange } from "./stats/PercentageChange";
import { EditableIncomeCard } from "./stats/EditableIncomeCard";
import { usePercentageChanges } from "@/hooks/usePercentageChanges";
import { formatCurrency } from "@/utils/formatters";
import { WalletBalanceCard } from "./wallet/WalletBalanceCard";

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
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[100px]" />
        ))}
      </div>
    );
  }
  
  // Format month name for display
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(selectedMonth);

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
      <OnboardingTooltip
        content="Track your wallet balance (Income + Added funds - Expenses)"
        defaultOpen={isNewUser}
      >
        <WalletBalanceCard walletBalance={walletBalance} />
      </OnboardingTooltip>
      
      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(monthlyExpenses, currencyCode)}
        icon={DollarSign}
      >
        <PercentageChange value={percentageChanges.expenses} inverse={true} />
      </StatCard>

      <EditableIncomeCard
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        percentageChange={percentageChanges.income}
        formatCurrency={formatCurrency}
        currencyCode={currencyCode}
      />

      <StatCard
        title="Savings Rate"
        value={formatPercentage(savingsRate)}
        icon={ArrowUpRight}
      >
        <PercentageChange value={percentageChanges.savings} />
      </StatCard>
    </div>
  );
};
