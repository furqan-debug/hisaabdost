
import { useState, useEffect } from "react";
import { useWalletQueries } from "./wallet/useWalletQueries";
import { useWalletMutations } from "./wallet/useWalletMutations";
import { WalletAdditionInput } from "./wallet/types";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

export type { WalletAddition, WalletAdditionInput } from "./wallet/types";

export function useWalletAdditions() {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Listen for wallet update events from Finny and manual operations
  useEffect(() => {
    const handleWalletUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail || {};
      const isFinnyEvent = detail.source === 'finny-chat' || detail.source === 'finny';
      
      console.log("Wallet update detected, immediate refresh", e.type, { isFinnyEvent, detail, userId: user?.id });
      
      if (!user?.id) return;
      
      // Define all query keys that need to be invalidated
      const queryKeysToInvalidate = [
        ['wallet-additions', user.id],
        ['wallet-additions-all', user.id],
        ['dashboard-data', user.id],
        ['monthly-data', user.id],
        ['activity_logs', user.id]
      ];
      
      // Always invalidate all related queries immediately
      queryKeysToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      if (isFinnyEvent) {
        console.log("IMMEDIATE wallet refresh for Finny event");
        
        // Force immediate refetch for Finny events with multiple attempts
        queryKeysToInvalidate.forEach(queryKey => {
          queryClient.refetchQueries({ queryKey });
        });
        
        // Additional refresh with shorter intervals for Finny
        setTimeout(() => {
          console.log("Secondary wallet refresh for Finny event");
          queryKeysToInvalidate.forEach(queryKey => {
            queryClient.refetchQueries({ queryKey });
          });
        }, 100);
        
        setTimeout(() => {
          console.log("Tertiary wallet refresh for Finny event");
          queryKeysToInvalidate.forEach(queryKey => {
            queryClient.refetchQueries({ queryKey });
          });
        }, 500);
      } else {
        // Standard refresh for manual operations
        setTimeout(() => {
          queryKeysToInvalidate.forEach(queryKey => {
            queryClient.refetchQueries({ queryKey });
          });
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
  }, [queryClient, user?.id]);

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
