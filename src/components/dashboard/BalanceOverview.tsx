
import React from "react";
import { StatCard } from "@/components/dashboard/stats/StatCard";
import { EditableIncomeCard } from "@/components/dashboard/stats/EditableIncomeCard";
import { WalletBalanceCard } from "@/components/dashboard/wallet/WalletBalanceCard";
import { PercentageChange } from "./stats/PercentageChange";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";
import { BadgeDollarSign, PiggyBank, TrendingDown, Wallet } from "lucide-react";
import { usePercentageChanges } from "@/hooks/usePercentageChanges";

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
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  formatPercentage,
  setMonthlyIncome,
  isNewUser = false,
  walletBalance
}) => {
  const { currencyCode } = useCurrency();
  
  // Get percentage changes from the hook
  const percentageChanges = usePercentageChanges(monthlyExpenses, monthlyIncome, savingsRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Box 1: Wallet Balance */}
      <WalletBalanceCard 
        walletBalance={walletBalance} 
        icon={<Wallet className="h-4 w-4 text-primary mb-1" />}
        className="bg-gradient-to-br from-card to-card/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
      />
      
      {/* Box 2: Monthly Expenses */}
      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(monthlyExpenses, currencyCode)}
        icon={<TrendingDown className="h-4 w-4 text-rose-500 mb-1" />}
        subtext={<PercentageChange value={percentageChanges.expenses} inverse={true} />}
        className="bg-gradient-to-br from-card to-card/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
      />
      
      {/* Box 3: Monthly Income */}
      <EditableIncomeCard
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        percentageChange={percentageChanges.income}
        formatCurrency={formatCurrency}
        currencyCode={currencyCode}
        icon={<BadgeDollarSign className="h-4 w-4 text-primary mb-1" />}
        className="bg-gradient-to-br from-card to-card/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
      />
      
      {/* Box 4: Savings Rate */}
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
