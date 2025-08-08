
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { WalletAddition } from "./types";
import { getQueryOptions } from "@/lib/queryConfig";

export function useWalletQueries() {
  const { user } = useAuth();

  // Get the current month for filtering
  const currentDate = new Date();
  const firstDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
  const lastDayOfMonth = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');

  // Query wallet additions for current month with optimized settings
  const { data: walletAdditions = [], isLoading } = useQuery({
    queryKey: ['wallet-additions', user?.id, firstDayOfMonth],
    queryFn: async () => {
      if (!user) return [];

      console.log('🔄 Fetching wallet additions for current month');
      const { data, error } = await supabase
        .from('wallet_additions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth)
        .neq('is_deleted_by_user', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching wallet additions:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} wallet additions for current month`);
      return data as WalletAddition[];
    },
    enabled: !!user,
    ...getQueryOptions('WALLET'),
  });

  // Query all wallet additions with optimized settings
  const { data: allWalletAdditions = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['wallet-additions-all', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('🔄 Fetching all wallet additions');
      const { data, error } = await supabase
        .from('wallet_additions')
        .select('*')
        .eq('user_id', user.id)
        .neq('is_deleted_by_user', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching all wallet additions:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} total wallet additions`);
      return data as WalletAddition[];
    },
    enabled: !!user,
    ...getQueryOptions('WALLET'),
  });

  // Calculate total additions
  const totalAdditions = walletAdditions.reduce((sum, addition) => sum + Number(addition.amount), 0);

  return {
    walletAdditions,
    allWalletAdditions,
    totalAdditions,
    isLoading,
    isLoadingAll,
  };
}
