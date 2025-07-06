
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Info, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { useWalletAdditions, type WalletAdditionInput } from "@/hooks/useWalletAdditions";
import { AddFundsDialog } from "@/components/dashboard/wallet/AddFundsDialog";
import { MonthlyIncomeService } from "@/services/monthlyIncomeService";
import { useMonthContext } from "@/hooks/use-month-context";
import { logIncomeActivity } from "@/services/activityLogService";
import { InfoPopover } from "./InfoPopover";

interface UnifiedFinancialSummaryProps {
  walletBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  isNewUser: boolean;
}

export const UnifiedFinancialSummary = ({
  walletBalance,
  monthlyExpenses,
  monthlyIncome,
  setMonthlyIncome,
  savingsRate,
  formatPercentage,
  isNewUser
}: UnifiedFinancialSummaryProps) => {
  const { currencyCode } = useCurrency();
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
  
  // Income editing state
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [incomeInputValue, setIncomeInputValue] = useState(monthlyIncome.toString());
  const [isUpdatingIncome, setIsUpdatingIncome] = useState(false);

  // Wallet additions
  const {
    totalAdditions,
    addFunds,
    isAddFundsOpen,
    setIsAddFundsOpen,
    isAdding
  } = useWalletAdditions();

  const handleAddFunds = (addition: WalletAdditionInput) => {
    addFunds(addition);
  };

  const handleIncomeUpdate = async () => {
    const newIncome = parseFloat(incomeInputValue);
    if (isNaN(newIncome) || newIncome < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingIncome(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const success = await MonthlyIncomeService.setMonthlyIncome(user.id, selectedMonth, newIncome);
      
      if (!success) {
        throw new Error("Failed to update monthly income");
      }

      try {
        await logIncomeActivity(newIncome, monthlyIncome);
      } catch (logError) {
        console.error('Failed to log income activity:', logError);
      }

      setMonthlyIncome(newIncome);
      setIsIncomeDialogOpen(false);
      
      toast({
        title: "Income Updated",
        description: `Monthly income updated to ${formatCurrency(newIncome, currencyCode)}`
      });
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: "Error",
        description: "Failed to update income. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingIncome(false);
    }
  };

  const getSavingsRateColor = () => {
    if (savingsRate >= 20) return "text-green-600";
    if (savingsRate >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getSavingsRateIcon = () => {
    if (savingsRate >= 20) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (savingsRate >= 10) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <>
      <Card className="w-full shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Financial Overview
            <InfoPopover
              title="Financial Overview"
              content="Your complete financial snapshot including wallet balance, expenses, income, and savings rate for this month."
              cardType="wallet"
            >
              <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </InfoPopover>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top Row - Main Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Balance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Wallet Balance</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddFundsOpen(true)}
                  className="h-7 px-2 text-xs hover:bg-primary/10 text-primary"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add Funds
                </Button>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(walletBalance, currencyCode)}</div>
              {totalAdditions > 0 && (
                <p className="text-xs text-muted-foreground">
                  Includes {formatCurrency(totalAdditions, currencyCode)} in added funds
                </p>
              )}
            </div>

            {/* Monthly Expenses */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Expenses</h3>
              <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses, currencyCode)}</div>
              <p className="text-xs text-muted-foreground">Total spent this month</p>
            </div>
          </div>

          <div className="border-t pt-6">
            {/* Bottom Row - Income and Savings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Income */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Monthly Income</h3>
                  <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-primary/10 text-primary"
                        onClick={() => setIncomeInputValue(monthlyIncome.toString())}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Monthly Income</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="income">Monthly Income ({currencyCode})</Label>
                          <Input
                            id="income"
                            type="text"
                            inputMode="decimal"
                            value={incomeInputValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                setIncomeInputValue(value);
                              }
                            }}
                            placeholder="Enter your monthly income"
                            autoFocus
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsIncomeDialogOpen(false)}
                            disabled={isUpdatingIncome}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleIncomeUpdate}
                            disabled={isUpdatingIncome}
                          >
                            {isUpdatingIncome ? 'Updating...' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(monthlyIncome, currencyCode)}</div>
                <p className="text-xs text-muted-foreground">Your monthly earnings</p>
              </div>

              {/* Savings Rate */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Savings Rate</h3>
                  {getSavingsRateIcon()}
                </div>
                <div className={`text-2xl font-bold ${getSavingsRateColor()}`}>
                  {formatPercentage(savingsRate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savingsRate >= 20 ? "Excellent savings!" : 
                   savingsRate >= 10 ? "Good progress" : "Room for improvement"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddFundsDialog
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        onAddFunds={handleAddFunds}
        isAdding={isAdding}
      />
    </>
  );
};
