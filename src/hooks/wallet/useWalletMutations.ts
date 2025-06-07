
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { logWalletActivity } from "@/services/activityLogService";
import { WalletAdditionInput, WalletAddition } from "./types";

export function useWalletMutations(allWalletAdditions: WalletAddition[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async (addition: WalletAdditionInput) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Adding funds:', addition);
      const { data, error } = await supabase
        .from('wallet_additions')
        .insert({
          user_id: user.id,
          amount: addition.amount,
          description: addition.description || 'Added funds',
          date: addition.date || new Date().toISOString().split('T')[0],
          fund_type: addition.fund_type || 'manual',
          carryover_month: addition.carryover_month,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding funds:', error);
        throw error;
      }
      
      console.log('Funds added successfully:', data);
      return data;
    },
    onSuccess: async (data) => {
      // Invalidate all wallet-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
      
      // Log the wallet activity with fund type
      try {
        await logWalletActivity(
          data.amount, 
          data.description || 'Added funds to wallet',
          data.fund_type || 'manual'
        );
      } catch (error) {
        console.error('Failed to log wallet activity:', error);
      }
      
      // Only show toast for manual additions to avoid spam
      if (data.fund_type === 'manual') {
        toast({
          title: "Success",
          description: "Funds added successfully"
        });
      }
    },
    onError: (error) => {
      console.error('Error adding funds:', error);
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete funds mutation (soft delete for carryover funds, hard delete for manual funds)
  const deleteFundsMutation = useMutation({
    mutationFn: async (fundId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Starting delete process for fund ID:', fundId);
      
      // First get the fund details from our local data
      const fund = allWalletAdditions.find(f => f.id === fundId);
      if (!fund) {
        console.error('Fund not found in local data:', fundId);
        throw new Error('Fund not found');
      }
      
      console.log('Found fund to delete:', fund);
      
      if (fund.fund_type === 'carryover') {
        console.log('Soft deleting carryover fund...');
        // Soft delete carryover funds by marking them as deleted by user
        const { data, error } = await supabase
          .from('wallet_additions')
          .update({ is_deleted_by_user: true })
          .eq('id', fundId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error soft deleting carryover fund:', error);
          throw error;
        }
        console.log('Carryover fund soft deleted successfully:', data);
        return fund;
      } else {
        console.log('Hard deleting manual fund...');
        // Hard delete manual funds
        const { error } = await supabase
          .from('wallet_additions')
          .delete()
          .eq('id', fundId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error hard deleting manual fund:', error);
          throw error;
        }
        console.log('Manual fund hard deleted successfully');
        return fund;
      }
    },
    onSuccess: async (deletedFund) => {
      console.log('Delete mutation successful, invalidating queries...');
      
      // Invalidate all wallet-related queries to refresh data immediately
      await queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
      
      // Log the wallet activity as a deduction with fund type
      try {
        await logWalletActivity(
          -deletedFund.amount, 
          `Deleted ${deletedFund.fund_type === 'carryover' ? 'carryover' : 'manual'} fund entry: ${deletedFund.description || 'Added funds'}`,
          deletedFund.fund_type || 'manual'
        );
      } catch (error) {
        console.error('Failed to log wallet activity:', error);
      }
      
      toast({
        title: "Success",
        description: `Fund entry deleted successfully`
      });
    },
    onError: (error) => {
      console.error('Delete mutation failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete fund entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    addFundsMutation,
    deleteFundsMutation,
    isAdding: addFundsMutation.isPending,
    isDeleting: deleteFundsMutation.isPending,
  };
}
