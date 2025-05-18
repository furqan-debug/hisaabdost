
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
  className?: string;
}

export function WalletBalanceCard({ walletBalance, icon, className }: WalletBalanceCardProps) {
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

  return (
    <>
      <StatCard
        title="Wallet Balance"
        icon={icon}
        value={formatCurrency(walletBalance, currencyCode)}
        className={className}
        subtext={
          totalAdditions > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
            >
              +{formatCurrency(totalAdditions, currencyCode)} this month
            </motion.div>
          ) : null
        }
        actionElement={
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddFundsOpen(true)}
            className="w-full justify-center text-xs font-medium"
          >
            <PlusCircle className="w-3 h-3 mr-1" /> Add Funds
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
