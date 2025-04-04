
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { formatCurrency } from "@/utils/chartUtils";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Edit, Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBudgetData } from "@/hooks/useBudgetData";

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
  const { updateMonthlyIncome } = useBudgetData();
  const currentMonthKey = format(selectedMonth, 'yyyy-MM');
  const [isEditing, setIsEditing] = useState(false);
  const [tempIncome, setTempIncome] = useState(monthlyIncome);
  const prevMonthlyIncomeRef = useRef(monthlyIncome);
  const updateTimerRef = useRef<number | null>(null);
  const monthKeyRef = useRef(currentMonthKey);
  
  // Update month key reference when it changes
  useEffect(() => {
    monthKeyRef.current = currentMonthKey;
  }, [currentMonthKey]);
  
  // Only update temp income when monthly income changes AND it's different from our previous value
  useEffect(() => {
    if (monthlyIncome !== prevMonthlyIncomeRef.current) {
      setTempIncome(monthlyIncome);
      prevMonthlyIncomeRef.current = monthlyIncome;
    }
  }, [monthlyIncome]);

  // Optimized function to update context data - with debouncing
  const updateContextData = () => {
    if (updateTimerRef.current) {
      window.clearTimeout(updateTimerRef.current);
    }
    
    updateTimerRef.current = window.setTimeout(() => {
      if (!isLoading) {
        // Only update if values are different from what's in state
        const currentBalance = totalBalance !== undefined ? totalBalance : 0;
        const currentExpenses = monthlyExpenses !== undefined ? monthlyExpenses : 0;
        const currentSavings = savingsRate !== undefined ? savingsRate : 0;
        
        updateMonthData(monthKeyRef.current, {
          monthlyIncome: prevMonthlyIncomeRef.current,
          monthlyExpenses: currentExpenses,
          totalBalance: currentBalance,
          savingsRate: currentSavings
        });
      }
      updateTimerRef.current = null;
    }, 500);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  // Handle income change with month-specific persistence
  const handleIncomeChange = (value: number) => {
    setTempIncome(value);
  };

  const saveIncome = async () => {
    // Only update if the value has actually changed
    if (tempIncome !== prevMonthlyIncomeRef.current) {
      // First update local state to make UI responsive
      setMonthlyIncome(tempIncome);
      prevMonthlyIncomeRef.current = tempIncome;
      
      // Now save to Supabase
      const success = await updateMonthlyIncome(tempIncome);
      
      if (success) {
        // Show confirmation toast
        toast.success("Monthly income updated successfully");
        
        // Update the context data with new income
        updateMonthData(monthKeyRef.current, {
          monthlyIncome: tempIncome
        });
      }
    }
    
    setIsEditing(false);
  };

  // When component unmounts or income changes, ensure data is saved
  useEffect(() => {
    return () => {
      // Final attempt to save any pending data on unmount
      if (prevMonthlyIncomeRef.current !== undefined) {
        updateMonthData(monthKeyRef.current, {
          monthlyIncome: prevMonthlyIncomeRef.current
        });
      }
    };
  }, [updateMonthData]);

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
                {formatCurrency(monthlyIncome)}
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
