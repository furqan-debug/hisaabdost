
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { formatCurrency } from "@/utils/chartUtils";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet } from "lucide-react";

interface StatCardsProps {
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  isNewUser: boolean;
}

export const StatCards = ({
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  setMonthlyIncome,
  savingsRate,
  formatPercentage,
  isNewUser,
}: StatCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <OnboardingTooltip
        content="Track your remaining balance after expenses"
        defaultOpen={isNewUser}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isNewUser ? "Add expenses to see your balance" : "Current account balance"}
            </p>
          </CardContent>
        </Card>
      </OnboardingTooltip>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div>
          <div className="flex items-center text-expense-high text-xs mt-2">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            12% from last month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              type="number"
              value={monthlyIncome}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setMonthlyIncome(value ? parseInt(value, 10) : 0);
              }}
              className="pl-9 pr-4"
              min={0}
            />
          </div>
          <div className="flex items-center text-expense-low text-xs mt-2">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            8% from last month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(savingsRate)}</div>
          <div className="flex items-center text-expense-low text-xs">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            2% from last month
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
