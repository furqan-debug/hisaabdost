
import { useState, useEffect } from "react";
import { useWalletQueries } from "./wallet/useWalletQueries";
import { useWalletMutations } from "./wallet/useWalletMutations";
import { WalletAdditionInput } from "./wallet/types";
import { useQueryClient } from "@tanstack/react-query";

export type { WalletAddition, WalletAdditionInput } from "./wallet/types";

export function useWalletAdditions() {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Listen for wallet update events from Finny
  useEffect(() => {
    const handleWalletUpdate = (e: Event) => {
      console.log("Wallet update detected, refreshing data", e);
      
      // Immediately invalidate and refetch wallet queries
      queryClient.invalidateQueries({ queryKey: ['wallet_additions'] });
      
      // Force a refetch after a short delay
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['wallet_additions'] });
      }, 100);
    };
    
    const eventTypes = ['wallet-updated', 'wallet-refresh'];
    
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleWalletUpdate);
    });
    
    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleWalletUpdate);
      });
    };
  }, [queryClient]);

  // Use the separated query and mutation hooks
  const {
    walletAdditions,
    allWalletAdditions,
    totalAdditions,
    isLoading,
    isLoadingAll,
  } = useWalletQueries();

  const {
    addFundsMutation,
    deleteFundsMutation,
    isAdding,
    isDeleting,
  } = useWalletMutations(allWalletAdditions);

  const addFunds = (addition: WalletAdditionInput) => {
    addFundsMutation.mutate(addition);
  };

  const deleteFunds = (fundId: string) => {
    console.log('Delete funds called for:', fundId);
    deleteFundsMutation.mutate(fundId);
  };

  return {
    walletAdditions,
    allWalletAdditions,
    totalAdditions,
    isLoading,
    isLoadingAll,
    addFunds,
    deleteFunds,
    isAddFundsOpen,
    setIsAddFundsOpen,
    isAdding,
    isDeleting
  };
}
