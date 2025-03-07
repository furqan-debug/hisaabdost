
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, Wallet, PiggyBank, Edit2, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/chartUtils";

interface StatCardsProps {
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (value: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  isNewUser: boolean;
  isPastMonth?: boolean;
  selectedMonth?: string;
}

export function StatCards({
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  setMonthlyIncome,
  savingsRate,
  formatPercentage,
  isNewUser,
  isPastMonth = false,
  selectedMonth = 'Current month'
}: StatCardsProps) {
  const isMobile = useIsMobile();
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeValue, setIncomeValue] = useState(monthlyIncome.toString());

  const handleIncomeChange = () => {
    const newValue = parseFloat(incomeValue);
    if (!isNaN(newValue)) {
      setMonthlyIncome(newValue);
    }
    setIsEditingIncome(false);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none text-muted-foreground">
                Balance
                {isPastMonth && (
                  <span className="block text-xs">{selectedMonth}</span>
                )}
              </span>
              <span className={`text-2xl font-bold ${totalBalance < 0 ? 'text-red-500' : ''}`}>
                {formatCurrency(totalBalance)}
              </span>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none text-muted-foreground">
                Expenses
                {isPastMonth && (
                  <span className="block text-xs">{selectedMonth}</span>
                )}
              </span>
              <span className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</span>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none text-muted-foreground">
                Monthly Income
              </span>
              {isEditingIncome ? (
                <div className="flex items-center space-x-1">
                  <Input
                    type="number"
                    value={incomeValue}
                    onChange={(e) => setIncomeValue(e.target.value)}
                    className="h-8 w-24"
                  />
                  <Button 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={handleIncomeChange}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</span>
                  {!isPastMonth && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => setIsEditingIncome(true)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium leading-none text-muted-foreground">
                Savings Rate
                {isPastMonth && (
                  <span className="block text-xs">{selectedMonth}</span>
                )}
              </span>
              <span className="text-2xl font-bold">{formatPercentage(savingsRate)}</span>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
              <PiggyBank className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
