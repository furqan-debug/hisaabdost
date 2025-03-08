
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { formatCurrency } from "@/utils/chartUtils";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardsProps {
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  isNewUser: boolean;
  isLoading?: boolean;
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
}: StatCardsProps) => {
  const isMobile = useIsMobile();
  const { selectedMonth, updateMonthData } = useMonthContext();
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  
  // Update month data when values change
  useEffect(() => {
    if (!isLoading) {
      updateMonthData(currentMonthKey, {
        monthlyIncome,
        monthlyExpenses,
        totalBalance,
        savingsRate
      });
    }
  }, [monthlyIncome, monthlyExpenses, totalBalance, savingsRate, currentMonthKey, updateMonthData, isLoading]);

  // Handle income change with month-specific persistence
  const handleIncomeChange = (value: number) => {
    setMonthlyIncome(value);
  };

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[100px]" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
      <OnboardingTooltip
        content="Track your remaining balance after expenses"
        defaultOpen={isNewUser}
      >
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isMobile ? 'p-3' : ''}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Total Balance</CardTitle>
            <Wallet className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
          </CardHeader>
          <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isNewUser ? "Add expenses to see your balance" : "Current account balance"}
            </p>
          </CardContent>
        </Card>
      </OnboardingTooltip>
      
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isMobile ? 'p-3' : ''}`}>
          <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Monthly Expenses</CardTitle>
          <DollarSign className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{formatCurrency(monthlyExpenses)}</div>
          <div className="flex items-center text-expense-high text-xs mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            12% from last month
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isMobile ? 'p-3' : ''}`}>
          <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Monthly Income</CardTitle>
          <DollarSign className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className="relative">
            <Input
              type="number"
              value={monthlyIncome || 0}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleIncomeChange(value ? parseInt(value, 10) : 0);
              }}
              className={`pl-6 pr-2 h-9 text-${isMobile ? 'sm' : 'base'}`}
              min={0}
            />
          </div>
          <div className="flex items-center text-expense-low text-xs mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            8% from last month
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isMobile ? 'p-3' : ''}`}>
          <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Savings Rate</CardTitle>
          <ArrowUpRight className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{formatPercentage(savingsRate)}</div>
          <div className="flex items-center text-expense-low text-xs mt-1">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            2% from last month
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
