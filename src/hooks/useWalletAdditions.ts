
import { useState } from "react";
import { useWalletQueries } from "./wallet/useWalletQueries";
import { useWalletMutations } from "./wallet/useWalletMutations";
import { WalletAdditionInput } from "./wallet/types";

export type { WalletAddition, WalletAdditionInput } from "./wallet/types";

export function useWalletAdditions() {
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

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
