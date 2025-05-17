
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
          <Skeleton key={i} className="h-[150px]" />
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
        subtext={percentageChanges.expenses !== 0 ? 
          <PercentageChange value={percentageChanges.expenses} inverse={true} /> : 
          "No change from last month"
        }
      />

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
        subtext={
          <div className="flex items-center">
            {percentageChanges.savings > 0 ? (
              <span className="text-green-500 flex items-center">
                ↑ {Math.abs(percentageChanges.savings).toFixed(1)}% from last month
              </span>
            ) : percentageChanges.savings < 0 ? (
              <span className="text-red-500 flex items-center">
                ↓ {Math.abs(percentageChanges.savings).toFixed(1)}% from last month
              </span>
            ) : (
              "No change from last month"
            )}
          </div>
        }
      />
    </div>
  );
};

// Add the PercentageChange component directly here since it's small and needs to be updated to match the new design
// This will allow us to use it inside the StatCards component
function PercentageChange({ value, inverse = false }: { value: number; inverse?: boolean }) {
  if (value === 0) return null;
  
  // For expenses, an increase is negative (red), but for income and savings, an increase is positive (green)
  const isNegative = inverse ? value > 0 : value < 0;
  
  return (
    <div className="flex items-center">
      {isNegative ? (
        <span className="text-red-500 flex items-center">
          ↓ {Math.abs(value).toFixed(1)}% from last month
        </span>
      ) : (
        <span className="text-green-500 flex items-center">
          ↑ {Math.abs(value).toFixed(1)}% from last month
        </span>
      )}
    </div>
  );
}
