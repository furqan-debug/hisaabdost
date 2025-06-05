
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
};

export type WalletAdditionInput = {
  amount: number;
  description?: string;
  date?: string;
};

export function useWalletAdditions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

  // Get the current month for filtering
  const currentDate = new Date();
  const firstDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
  const lastDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');

  // Query wallet additions
  const { data: walletAdditions = [], isLoading } = useQuery({
    queryKey: ['wallet-additions', user?.id, firstDayOfMonth, lastDayOfMonth],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('wallet_additions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching wallet additions:', error);
        return [];
      }

      return data as WalletAddition[];
    },
    enabled: !!user,
  });

  // Calculate total additions
  const totalAdditions = walletAdditions.reduce((sum, addition) => sum + Number(addition.amount), 0);

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async (addition: WalletAdditionInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('wallet_additions')
        .insert({
          user_id: user.id,
          amount: addition.amount,
          description: addition.description || 'Added funds',
          date: addition.date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
      
      // Log the wallet activity
      try {
        await logWalletActivity(data.amount, data.description || 'Added funds to wallet');
      } catch (error) {
        console.error('Failed to log wallet activity:', error);
      }
      
      toast({
        title: "Success",
        description: "Funds added successfully"
      });
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

  const addFunds = (addition: WalletAdditionInput) => {
    addFundsMutation.mutate(addition);
  };

  return {
    walletAdditions,
    totalAdditions,
    isLoading,
    addFunds,
    isAddFundsOpen,
    setIsAddFundsOpen,
    isAdding: addFundsMutation.isPending
  };
}
