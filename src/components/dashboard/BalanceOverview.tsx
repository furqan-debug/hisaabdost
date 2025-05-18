
import React from "react";
import { StatCards } from "@/components/dashboard/StatCards";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWalletAdditions, type WalletAdditionInput } from "@/hooks/useWalletAdditions";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";
import { AddFundsDialog } from "@/components/dashboard/wallet/AddFundsDialog";

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
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  formatPercentage,
  setMonthlyIncome,
  isNewUser = false,
  walletBalance
}) => {
  const { currencyCode } = useCurrency();
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
  
  // Create a motivational message based on the total additions
  const getMotivationalMessage = () => {
    if (totalAdditions > 0) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1"
        >
          You've added {formatCurrency(totalAdditions, currencyCode)} this month. Keep it up! 🎉
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <OnboardingTooltip
          content="Track your wallet balance (Income + Added funds - Expenses)"
          defaultOpen={isNewUser}
        >
          <Card className="md:col-span-1 overflow-hidden bg-gradient-to-br from-card to-card/95 backdrop-blur-sm shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium text-foreground">Wallet Balance</h3>
              </div>
              
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-bold">
                  {formatCurrency(walletBalance, currencyCode)}
                </span>
                
                <div className="mt-2">
                  {getMotivationalMessage()}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddFundsOpen(true)}
                  className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 hover:border-primary/30 font-medium justify-between"
                >
                  <span>Add Funds to stay on track</span>
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </OnboardingTooltip>
        
        <StatCards
          totalBalance={totalBalance}
          monthlyExpenses={monthlyExpenses}
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={setMonthlyIncome}
          savingsRate={savingsRate}
          formatPercentage={formatPercentage}
          isNewUser={isNewUser}
          className="md:col-span-2"
        />
      </div>
      
      <AddFundsDialog 
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        onAddFunds={handleAddFunds}
        isAdding={isAdding}
      />
    </div>
  );
};
