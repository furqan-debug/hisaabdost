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
export function WalletBalanceCard({
  walletBalance
}: WalletBalanceCardProps) {
  const {
    currencyCode
  } = useCurrency();
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
  return <>
      <StatCard title="Wallet Balance" value={formatCurrency(walletBalance, currencyCode)} subtext={totalAdditions > 0 ? `Includes ${formatCurrency(totalAdditions, currencyCode)} in added funds` : undefined} infoTooltip="Your wallet balance represents the total amount of money you have available to spend. This includes your monthly income plus any additional funds you've manually added (like bonuses, gifts, or transfers from savings). This is your current spending power and helps you track how much money you have left for expenses this month." cardType="wallet" actionElement={<Button type="button" variant="outline" size="sm" onClick={handleOpenAddFunds} className="w-full text-primary hover:bg-primary/10 flex items-center justify-center gap-1 mx-0 py-0 my-px">
            <PlusCircle className="h-4 w-4" />
            <span>Add Funds</span>
          </Button>} />
      
      <AddFundsDialog isOpen={isAddFundsOpen} onClose={handleCloseAddFunds} onAddFunds={handleAddFunds} isAdding={isAdding} />
    </>;
}