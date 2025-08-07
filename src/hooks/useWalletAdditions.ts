
import { useState, useEffect } from "react";
import { useWalletQueries } from "./wallet/useWalletQueries";
import { useWalletMutations } from "./wallet/useWalletMutations";
import { WalletAdditionInput } from "./wallet/types";
import { useQueryClient } from "@tanstack/react-query";

export type { WalletAddition, WalletAdditionInput } from "./wallet/types";

export function useWalletAdditions() {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Listen for wallet update events from Finny and manual operations
  useEffect(() => {
    const handleWalletUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail || {};
      const isFinnyEvent = detail.source === 'finny-chat' || detail.source === 'finny';
      
      console.log("Wallet update detected, immediate refresh", e.type, { isFinnyEvent, detail });
      
      // Always invalidate all wallet queries immediately
      queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-additions-all'] });
      
      if (isFinnyEvent) {
        console.log("IMMEDIATE wallet refresh for Finny event");
        
        // Force immediate refetch for Finny events with multiple attempts
        queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
        queryClient.refetchQueries({ queryKey: ['wallet-additions-all'] });
        
        // Additional refresh with shorter intervals for Finny
        setTimeout(() => {
          console.log("Secondary wallet refresh for Finny event");
          queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
          queryClient.refetchQueries({ queryKey: ['wallet-additions-all'] });
        }, 100);
        
        setTimeout(() => {
          console.log("Tertiary wallet refresh for Finny event");
          queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
          queryClient.refetchQueries({ queryKey: ['wallet-additions-all'] });
        }, 500);
      } else {
        // Standard refresh for manual operations
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
          queryClient.refetchQueries({ queryKey: ['wallet-additions-all'] });
        }, 50);
      }
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
