
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stats/StatCard";
import { AddFundsDialog } from "@/components/dashboard/wallet/AddFundsDialog";
import { useWalletAdditions, type WalletAdditionInput } from "@/hooks/useWalletAdditions";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface WalletBalanceCardProps {
  walletBalance: number;
}

export function WalletBalanceCard({ walletBalance }: WalletBalanceCardProps) {
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
        value={formatCurrency(walletBalance, currencyCode)}
        subtext={totalAdditions > 0 ? 
          <span className="text-xs text-muted-foreground">
            Includes {formatCurrency(totalAdditions, currencyCode)} in added funds
          </span> : undefined
        }
        actionElement={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddFundsOpen(true)}
            className="text-primary hover:bg-primary/10 px-2 py-1 h-auto flex items-center text-xs font-medium"
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
