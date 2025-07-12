import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalsHeader } from "@/components/goals/GoalsHeader";
import { GoalsEmptyState } from "@/components/goals/GoalsEmptyState";
import { GoalsGrid } from "@/components/goals/GoalsGrid";
import { useCurrency } from "@/hooks/use-currency";
import { useGoalCalculations } from "@/hooks/useGoalCalculations";
import { useGoalManagement } from "@/hooks/useGoalManagement";
import { startOfMonth, endOfMonth } from "date-fns";
import { BannerAd } from "@/components/ads/BannerAd";
import { useModalState } from "@/hooks/useModalState";

interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  category: string;
  deadline: string;
  created_at: string;
}

export default function Goals() {
  const { isModalOpen } = useModalState();
  const { user } = useAuth();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const { currencyCode } = useCurrency();
  const { refreshTrigger, handleDeleteGoal, syncGoalProgress } = useGoalManagement();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching goals for user:", user.id, "refreshTrigger:", refreshTrigger);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching goals:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} goals:`, data);
      return data as Goal[];
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { calculateCategorySavings, calculateProgress, generateTip } = useGoalCalculations(
    expenses || [], 
    budgets || [], 
    currencyCode
  );

  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setShowGoalForm(true);
  };

  const handleSyncGoalProgress = (goal: Goal) => {
    syncGoalProgress(goal, calculateCategorySavings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-4 md:p-6 space-y-8">
          <div className="mt-2 mb-4">
            <BannerAd 
              adId="ca-app-pub-8996865130200922/7297544623" 
              visible={!isModalOpen} 
            />
          </div>
          
          <GoalsHeader onCreateGoal={handleCreateGoal} />

          {goals?.length === 0 ? (
            <GoalsEmptyState onCreateGoal={handleCreateGoal} />
          ) : (
            <GoalsGrid
              goals={goals || []}
              calculateCategorySavings={calculateCategorySavings}
              calculateProgress={calculateProgress}
              generateTip={generateTip}
              budgets={budgets || []}
              currencyCode={currencyCode}
              onDeleteGoal={handleDeleteGoal}
              syncGoalProgress={handleSyncGoalProgress}
            />
          )}
        </div>
      </div>

      <GoalForm 
        open={showGoalForm} 
        onOpenChange={setShowGoalForm} 
        goal={selectedGoal} 
      />
    </>
  );
}
