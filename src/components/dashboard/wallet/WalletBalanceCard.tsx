
import { PlusCircle, Wallet, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stats/StatCard";
import { AddFundsDialog } from "@/components/dashboard/wallet/AddFundsDialog";
import { DeleteFundsDialog } from "@/components/dashboard/wallet/DeleteFundsDialog";
import { useWalletAdditions, type WalletAdditionInput } from "@/hooks/useWalletAdditions";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { useState } from "react";
import { format } from "date-fns";

interface WalletBalanceCardProps {
  walletBalance: number;
}

export function WalletBalanceCard({ walletBalance }: WalletBalanceCardProps) {
  const { currencyCode } = useCurrency();
  const { 
    walletAdditions,
    totalAdditions, 
    addFunds, 
    deleteFunds,
    isAddFundsOpen, 
    setIsAddFundsOpen, 
    isAdding,
    isDeleting
  } = useWalletAdditions();
  
  const [selectedAddition, setSelectedAddition] = useState<any>(null);
  
  const handleOpenAddFunds = () => {
    setIsAddFundsOpen(true);
  };

  const handleCloseAddFunds = () => {
    setIsAddFundsOpen(false);
  };

  const handleAddFunds = (addition: WalletAdditionInput) => {
    addFunds(addition);
  };

  const handleDeleteFunds = (additionId: string) => {
    deleteFunds(additionId);
    setSelectedAddition(null);
  };

  const handleAdditionClick = (addition: any) => {
    setSelectedAddition(addition);
  };

  const handleCloseDelete = () => {
    setSelectedAddition(null);
  };

  return (
    <>
      <div className="space-y-3">
        <StatCard
          title="Wallet Balance"
          value={formatCurrency(walletBalance, currencyCode)}
          subtext={totalAdditions > 0 ? `Includes ${formatCurrency(totalAdditions, currencyCode)} in added funds` : undefined}
          infoTooltip="Your wallet balance represents the total amount of money you have available to spend. This includes your monthly income plus any additional funds you've manually added (like bonuses, gifts, or transfers from savings). This is your current spending power and helps you track how much money you have left for expenses this month."
          cardType="wallet"
          actionElement={
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAddFunds}
              className="w-full text-primary hover:bg-primary/10 flex items-center justify-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Funds</span>
            </Button>
          }
        />

        {/* Show wallet additions if any exist */}
        {walletAdditions.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-3">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Added Funds This Month
            </h4>
            <div className="space-y-2">
              {walletAdditions.map((addition) => (
                <div
                  key={addition.id}
                  onClick={() => handleAdditionClick(addition)}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {addition.description || 'Added funds'}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(addition.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      +{formatCurrency(addition.amount, currencyCode)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <AddFundsDialog 
        isOpen={isAddFundsOpen}
        onClose={handleCloseAddFunds}
        onAddFunds={handleAddFunds}
        isAdding={isAdding}
      />

      <DeleteFundsDialog
        isOpen={!!selectedAddition}
        onClose={handleCloseDelete}
        onDelete={() => handleDeleteFunds(selectedAddition?.id)}
        addition={selectedAddition}
        isDeleting={isDeleting}
      />
    </>
  );
}
