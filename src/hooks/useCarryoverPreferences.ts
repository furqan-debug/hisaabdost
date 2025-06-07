
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type CarryoverPreferences = {
  id: string;
  user_id: string;
  auto_carryover_enabled: boolean;
  processed_months: string[];
  created_at: string;
  updated_at: string;
};

export function useCarryoverPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query user carryover preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['carryover-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;

      console.log('Fetching carryover preferences');
      const { data, error } = await supabase
        .from('user_carryover_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching carryover preferences:', error);
        return null;
      }

      console.log('Carryover preferences:', data);
      return data as CarryoverPreferences | null;
    },
    enabled: !!user,
  });

  // Create or update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<CarryoverPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Updating carryover preferences:', updates);

      if (preferences) {
        // Update existing preferences
        const { data, error } = await supabase
          .from('user_carryover_preferences')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating preferences:', error);
          throw error;
        }
        console.log('Preferences updated:', data);
        return data;
      } else {
        // Create new preferences
        const { data, error } = await supabase
          .from('user_carryover_preferences')
          .insert({
            user_id: user.id,
            auto_carryover_enabled: updates.auto_carryover_enabled ?? true,
            processed_months: updates.processed_months ?? [],
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating preferences:', error);
          throw error;
        }
        console.log('Preferences created:', data);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carryover-preferences'] });
    },
  });

  // Helper to check if a month has been processed
  const isMonthProcessed = (monthKey: string) => {
    const processed = preferences?.processed_months?.includes(monthKey) ?? false;
    console.log(`Month ${monthKey} processed:`, processed);
    return processed;
  };

  // Helper to mark a month as processed
  const markMonthAsProcessed = (monthKey: string) => {
    console.log(`Marking month ${monthKey} as processed`);
    const currentProcessedMonths = preferences?.processed_months ?? [];
    if (!currentProcessedMonths.includes(monthKey)) {
      updatePreferencesMutation.mutate({
        processed_months: [...currentProcessedMonths, monthKey],
      });
    }
  };

  // Helper to check if carryover exists for a month
  const checkCarryoverExists = async (monthKey: string) => {
    if (!user) return false;

    console.log(`Checking if carryover exists for month: ${monthKey}`);
    const { data, error } = await supabase
      .from('wallet_additions')
      .select('id')
      .eq('user_id', user.id)
      .eq('fund_type', 'carryover')
      .eq('carryover_month', monthKey)
      .neq('is_deleted_by_user', true)
      .limit(1);

    if (error) {
      console.error('Error checking carryover existence:', error);
      return false;
    }

    const exists = data && data.length > 0;
    console.log(`Carryover exists for ${monthKey}:`, exists);
    return exists;
  };

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
    isMonthProcessed,
    markMonthAsProcessed,
    checkCarryoverExists,
  };
}
