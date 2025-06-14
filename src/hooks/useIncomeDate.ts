
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/**
 * Hook for fetching and updating the user's preferred income date.
 * incomeDate: integer 1-31
 */
export function useIncomeDate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current income date from the user's profile
  const { data: incomeDate, isLoading } = useQuery({
    queryKey: ['profile-income-date', user?.id],
    queryFn: async () => {
      if (!user) return 1; // default to 1st of month
      const { data, error } = await supabase
        .from("profiles")
        .select("income_date")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.income_date ?? 1;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Update mutation
  const { mutate: setIncomeDate, isPending: isUpdating } = useMutation({
    mutationFn: async (date: number) => {
      if (!user) throw new Error("No user");
      if (date < 1 || date > 31) throw new Error("Invalid income date");
      const { error } = await supabase
        .from("profiles")
        .update({ income_date: date })
        .eq("id", user.id);
      if (error) throw error;
      return date;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-income-date'] });
    }
  });

  return {
    incomeDate: incomeDate ?? 1,
    setIncomeDate,
    isLoading,
    isUpdating,
  };
}
