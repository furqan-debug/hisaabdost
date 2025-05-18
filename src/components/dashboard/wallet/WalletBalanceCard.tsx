
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stats/StatCard";
import { AddFundsDialog } from "@/components/dashboard/wallet/AddFundsDialog";
import { useWalletAdditions, type WalletAdditionInput } from "@/hooks/useWalletAdditions";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import React from "react";
import { motion } from "framer-motion";

interface WalletBalanceCardProps {
  walletBalance: number;
  icon?: React.ReactNode;
}

export function WalletBalanceCard({ walletBalance, icon }: WalletBalanceCardProps) {
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
    <>
      <StatCard
        title="Wallet Balance"
        icon={icon}
        value={
          <span className="text-xl md:text-2xl font-bold">{formatCurrency(walletBalance, currencyCode)}</span>
        }
        subtext={
          <div className="mt-1">
            {getMotivationalMessage()}
          </div>
        }
        actionElement={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddFundsOpen(true)}
            className="text-primary hover:bg-primary/10 px-3 py-1 h-auto flex items-center text-xs font-medium mt-2"
          >
            <PlusCircle className="w-3 h-3 mr-1" /> Add Funds ➕ to stay on track
          </Button>
        }
      />
      
      <AddFundsDialog 
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        onAddFunds={handleAddFunds}
        isAdding={isAdding}
      />
    </>
  );
}
