
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
import { PercentageChange } from "./stats/PercentageChange";
import { TrendingDown, BadgeDollarSign, PiggyBank } from "lucide-react";

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
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 p-1">
      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(monthlyExpenses, currencyCode)}
        icon={<TrendingDown className="h-4 w-4 text-rose-500 mb-1" />}
        subtext={<PercentageChange value={percentageChanges.expenses} inverse={true} />}
      />

      <EditableIncomeCard
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        percentageChange={percentageChanges.income}
        formatCurrency={formatCurrency}
        currencyCode={currencyCode}
        icon={<BadgeDollarSign className="h-4 w-4 text-primary mb-1" />}
      />

      <StatCard
        title="Savings Rate"
        value={formatPercentage(savingsRate)}
        icon={<PiggyBank className="h-4 w-4 text-emerald-500 mb-1" />}
        subtext={<PercentageChange value={percentageChanges.savings} />}
      />
    </div>
  );
};
