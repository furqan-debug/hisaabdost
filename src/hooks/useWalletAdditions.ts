
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { logWalletActivity } from "@/services/activityLogService";

export type WalletAddition = {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  fund_type?: 'manual' | 'carryover';
  carryover_month?: string;
  is_deleted_by_user?: boolean;
};

export type WalletAdditionInput = {
  amount: number;
  description?: string;
  date?: string;
  fund_type?: 'manual' | 'carryover';
  carryover_month?: string;
};

export function useWalletAdditions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  // Get the current month for filtering
  const currentDate = new Date();
  const firstDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
  const lastDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');

  // Query wallet additions for current month (excluding deleted carryover funds)
  const { data: walletAdditions = [], isLoading } = useQuery({
    queryKey: ['wallet-additions', user?.id, firstDayOfMonth, lastDayOfMonth],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching wallet additions for current month');
      const { data, error } = await supabase
        .from('wallet_additions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth)
        .neq('is_deleted_by_user', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching wallet additions:', error);
        return [];
      }

      console.log(`Found ${data?.length || 0} wallet additions`);
      return data as WalletAddition[];
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  // Query all wallet additions (for manage funds page, excluding soft-deleted)
  const { data: allWalletAdditions = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['wallet-additions-all', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching all wallet additions');
      const { data, error } = await supabase
        .from('wallet_additions')
        .select('*')
        .eq('user_id', user.id)
        .neq('is_deleted_by_user', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching all wallet additions:', error);
        return [];
      }

      console.log(`Found ${data?.length || 0} total wallet additions`);
      return data as WalletAddition[];
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  // Calculate total additions
  const totalAdditions = walletAdditions.reduce((sum, addition) => sum + Number(addition.amount), 0);

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
      setIsAddFundsOpen(false);
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
      
      console.log('Deleting fund:', fundId);
      
      // First get the fund details
      const fund = allWalletAdditions.find(f => f.id === fundId);
      if (!fund) {
        throw new Error('Fund not found');
      }
      
      if (fund.fund_type === 'carryover') {
        // Soft delete carryover funds by marking them as deleted by user
        const { error } = await supabase
          .from('wallet_additions')
          .update({ is_deleted_by_user: true })
          .eq('id', fundId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error soft deleting carryover fund:', error);
          throw error;
        }
        console.log('Carryover fund soft deleted');
      } else {
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
        console.log('Manual fund hard deleted');
      }
      
      return fund;
    },
    onSuccess: async (deletedFund) => {
      console.log('Fund deleted successfully, refreshing data');
      
      // Invalidate all wallet-related queries to refresh data immediately
      queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
      
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
        description: "Fund entry deleted successfully"
      });
    },
    onError: (error) => {
      console.error('Error deleting funds:', error);
      toast({
        title: "Error",
        description: "Failed to delete fund entry. Please try again.",
        variant: "destructive"
      });
    }
  });

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
    isAdding: addFundsMutation.isPending,
    isDeleting: deleteFundsMutation.isPending
  };
}
