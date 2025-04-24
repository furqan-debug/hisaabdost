import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { formatCurrency } from "@/utils/formatters";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Edit, Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMonthContext } from "@/hooks/use-month-context";
import { format, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";

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
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
  const { currencyCode } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [tempIncome, setTempIncome] = useState(monthlyIncome);
  const [percentageChanges, setPercentageChanges] = useState({
    expenses: 0,
    income: 0,
    savings: 0
  });

  useEffect(() => {
    const fetchPreviousMonthData = async () => {
      if (!user) return;

      const previousMonth = subMonths(selectedMonth, 1);
      const prevMonthStart = format(previousMonth, 'yyyy-MM-01');
      const prevMonthEnd = format(previousMonth, 'yyyy-MM-dd');

      try {
        const { data: prevExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', prevMonthStart)
          .lte('date', prevMonthEnd);

        const prevMonthExpenses = prevExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
        const prevMonthIncome = monthlyIncome;
        const prevSavingsRate = prevMonthIncome > 0 
          ? ((prevMonthIncome - prevMonthExpenses) / prevMonthIncome) * 100 
          : 0;

        const expensesChange = prevMonthExpenses > 0 
          ? ((monthlyExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 
          : 0;
        const incomeChange = prevMonthIncome > 0 
          ? ((monthlyIncome - prevMonthIncome) / prevMonthIncome) * 100 
          : 0;
        const savingsChange = prevSavingsRate > 0 
          ? (savingsRate - prevSavingsRate) 
          : 0;

        setPercentageChanges({
          expenses: expensesChange,
          income: incomeChange,
          savings: savingsChange
        });
      } catch (error) {
        console.error("Error fetching previous month data:", error);
      }
    };

    if (!isLoading) {
      fetchPreviousMonthData();
    }
  }, [user, selectedMonth, monthlyExpenses, monthlyIncome, savingsRate, isLoading]);

  const handleIncomeChange = (value: number) => {
    setTempIncome(value);
  };

  const saveIncome = async () => {
    try {
      if (!user) return;
      
      const { data: existingBudgets, error: fetchError } = await supabase
        .from('budgets')
        .select('id, monthly_income')
        .eq('user_id', user.id)
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (existingBudgets && existingBudgets.length > 0) {
        const { error } = await supabase
          .from('budgets')
          .update({ monthly_income: tempIncome })
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category: 'General',
            amount: 0,
            period: 'monthly',
            monthly_income: tempIncome
          });
          
        if (error) throw error;
      }
      
      setMonthlyIncome(tempIncome);
      setIsEditing(false);
      
      toast.success("Monthly income updated successfully");
    } catch (error) {
      console.error("Error saving monthly income:", error);
      toast.error("Failed to save monthly income");
    }
  };

  const renderPercentageChange = (value: number, inverse = false) => {
    const isPositive = inverse ? value < 0 : value > 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    const textColor = isPositive ? "text-expense-high" : "text-expense-low";

    return (
      <div className={`flex items-center ${textColor} text-xs mt-1`}>
        <Icon className="h-3 w-3 mr-1" />
        {Math.abs(value).toFixed(1)}% from last month
      </div>
    );
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
              {formatCurrency(totalBalance, currencyCode)}
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
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
            {formatCurrency(monthlyExpenses, currencyCode)}
          </div>
          {renderPercentageChange(percentageChanges.expenses, true)}
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isMobile ? 'p-3' : ''}`}>
          <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Monthly Income</CardTitle>
          {!isEditing ? (
            <Edit 
              className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground cursor-pointer hover:text-primary transition-colors`} 
              onClick={() => setIsEditing(true)}
            />
          ) : (
            <Save 
              className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-primary cursor-pointer hover:text-primary/80 transition-colors`} 
              onClick={() => saveIncome()}
            />
          )}
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          {!isEditing ? (
            <>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                {formatCurrency(monthlyIncome, currencyCode)}
              </div>
              {renderPercentageChange(percentageChanges.income)}
            </>
          ) : (
            <div className="space-y-2">
              <Input
                type="number"
                value={tempIncome || 0}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleIncomeChange(value ? parseInt(value, 10) : 0);
                }}
                className={`h-8 text-${isMobile ? 'sm' : 'base'} pr-2`}
                min={0}
              />
              <Button 
                size="sm" 
                className="w-full h-7 text-xs" 
                onClick={saveIncome}
              >
                Save
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isMobile ? 'p-3' : ''}`}>
          <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Savings Rate</CardTitle>
          <ArrowUpRight className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{formatPercentage(savingsRate)}</div>
          {renderPercentageChange(percentageChanges.savings)}
        </CardContent>
      </Card>
    </div>
  );
};
