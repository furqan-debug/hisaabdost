
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { formatCurrency } from "@/utils/formatters";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Edit, Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";
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
  const { selectedMonth, updateMonthData } = useMonthContext();
  const { currencyCode } = useCurrency();
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const [isEditing, setIsEditing] = useState(false);
  const [tempIncome, setTempIncome] = useState(monthlyIncome);
  
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

  // Reset temp income when monthly income changes
  useEffect(() => {
    setTempIncome(monthlyIncome);
  }, [monthlyIncome]);

  // Handle income change with month-specific persistence
  const handleIncomeChange = (value: number) => {
    setTempIncome(value);
  };

  const saveIncome = async () => {
    try {
      if (!user) return;
      
      // Save to Supabase - check if there's already a budget record for this month
      const { data: existingBudgets, error: fetchError } = await supabase
        .from('budgets')
        .select('id, monthly_income')
        .eq('user_id', user.id)
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      if (existingBudgets && existingBudgets.length > 0) {
        // Update existing budget record(s) with new monthly income
        const { error } = await supabase
          .from('budgets')
          .update({ monthly_income: tempIncome })
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Create a new budget record with the monthly income
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category: 'General', // Default category
            amount: 0, // Default amount
            period: 'monthly', // Default period
            monthly_income: tempIncome
          });
          
        if (error) throw error;
      }
      
      // Update local state
      setMonthlyIncome(tempIncome);
      setIsEditing(false);
      
      toast.success("Monthly income updated successfully");
    } catch (error) {
      console.error("Error saving monthly income:", error);
      toast.error("Failed to save monthly income");
    }
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
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{formatCurrency(monthlyExpenses, currencyCode)}</div>
          <div className="flex items-center text-expense-high text-xs mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            12% from last month
          </div>
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
              onClick={saveIncome}
            />
          )}
        </CardHeader>
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          {!isEditing ? (
            <>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                {formatCurrency(monthlyIncome, currencyCode)}
              </div>
              <div className="flex items-center text-expense-low text-xs mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                8% from last month
              </div>
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
          <div className="flex items-center text-expense-low text-xs mt-1">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            2% from last month
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
