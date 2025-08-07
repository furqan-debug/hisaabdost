
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
    const handleWalletUpdate = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail || {};
      const isFinnyEvent = detail.source === 'finny-chat' || detail.source === 'finny';
      
      console.log("🔄 Wallet update detected - immediate refresh", e.type, { isFinnyEvent, detail });
      
      // Force immediate invalidation of all wallet queries
      await queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet-additions-all'] });
      
      // Force immediate refetch with no delay
      queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
      queryClient.refetchQueries({ queryKey: ['wallet-additions-all'] });
      
      if (isFinnyEvent) {
        console.log("🚀 FINNY EVENT - Enhanced refresh sequence");
        
        // Multiple refresh attempts for Finny events
        setTimeout(async () => {
          console.log("🔄 Secondary refresh for Finny event");
          await queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet-additions-all'] });
          queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
          queryClient.refetchQueries({ queryKey: ['wallet-additions-all'] });
        }, 100);
        
        setTimeout(async () => {
          console.log("🔄 Tertiary refresh for Finny event");
          await queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet-additions-all'] });
          queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
          queryClient.refetchQueries({ queryKey: ['wallet-additions-all'] });
        }, 300);
        
        // Also refresh dashboard and activity logs for Finny events
        setTimeout(async () => {
          console.log("🔄 Refreshing dashboard and activity logs");
          await queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
          await queryClient.invalidateQueries({ queryKey: ['monthly_income'] });
          await queryClient.invalidateQueries({ queryKey: ['expenses'] });
          queryClient.refetchQueries({ queryKey: ['activity_logs'] });
        }, 500);
      }
    };
    
    // Listen to multiple event types for comprehensive coverage
    const eventTypes = [
      'wallet-updated', 
      'wallet-refresh',
      'finny-advanced-action',
      'finny-expense-added'  // Also listen for Finny expense events that might affect wallet
    ];
    
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
