
import React from "react";
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
  className?: string;
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
  className = "",
}: StatCardsProps) => {
  const { currencyCode } = useCurrency();
  const { selectedMonth } = useMonthContext();
  
  // Get percentage changes from the hook
  const percentageChanges = usePercentageChanges(monthlyExpenses, monthlyIncome, savingsRate);

  if (isLoading) {
    return (
      <div className={`grid gap-4 grid-cols-1 md:grid-cols-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 grid-cols-1 md:grid-cols-3 ${className}`}>
      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(monthlyExpenses, currencyCode)}
        icon={<TrendingDown className="h-4 w-4 text-rose-500 mb-1" />}
        subtext={<PercentageChange value={percentageChanges.expenses} inverse={true} />}
        className="bg-gradient-to-br from-card to-card/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
      />

      <EditableIncomeCard
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        percentageChange={percentageChanges.income}
        formatCurrency={formatCurrency}
        currencyCode={currencyCode}
        icon={<BadgeDollarSign className="h-4 w-4 text-primary mb-1" />}
        className="bg-gradient-to-br from-card to-card/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
      />

      <StatCard
        title="Savings Rate"
        value={formatPercentage(savingsRate)}
        icon={<PiggyBank className="h-4 w-4 text-emerald-500 mb-1" />}
        subtext={<PercentageChange value={percentageChanges.savings} />}
        className="bg-gradient-to-br from-card to-card/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
      />
    </div>
  );
};
