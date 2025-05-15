
import { PlusCircle, Wallet } from "lucide-react";
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
  
  const handleOpenAddFunds = () => {
    setIsAddFundsOpen(true);
  };

  const handleCloseAddFunds = () => {
    setIsAddFundsOpen(false);
  };

  const handleAddFunds = (addition: WalletAdditionInput) => {
    addFunds(addition);
  };

  return (
    <>
      <StatCard
        title="Wallet Balance"
        value={formatCurrency(walletBalance, currencyCode)}
        icon={Wallet}
        subtext={totalAdditions > 0 ? `Added funds: ${formatCurrency(totalAdditions, currencyCode)}` : undefined}
        className="relative"
      >
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={handleOpenAddFunds}
            className="text-primary hover:text-primary/90 hover:bg-primary/10"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">Add funds</span>
          </Button>
        </div>
      </StatCard>
      
      <AddFundsDialog 
        isOpen={isAddFundsOpen}
        onClose={handleCloseAddFunds}
        onAddFunds={handleAddFunds}
        isAdding={isAdding}
      />
    </>
  );
}
