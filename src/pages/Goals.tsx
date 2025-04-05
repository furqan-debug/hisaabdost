
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, startOfMonth, endOfMonth, parseISO, isAfter } from "date-fns";
import { GoalForm } from "@/components/goals/GoalForm";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching goals:", error);
        throw error;
      }
      
      return data as Goal[];
    },
    enabled: !!user,
  });

  // Fetch all expenses to calculate savings per category
  const { data: expenses } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get all expenses for calculation, not just current month
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch budgets to calculate savings (budget amount - expenses)
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
    enabled: !!user,
  });

  // Calculate category savings since goal creation
  const calculateCategorySavings = (goal: Goal) => {
    if (!expenses || !budgets) return 0;
    
    // Get budget for this category
    const categoryBudget = budgets.find(b => b.category === goal.category);
    if (!categoryBudget) return 0;
    
    // Calculate total expenses for this category since goal creation
    const goalStartDate = new Date(goal.created_at);
    const expensesInCategory = expenses.filter(e => 
      e.category === goal.category && 
      isAfter(new Date(e.date), goalStartDate)
    );
    
    const totalExpenses = expensesInCategory.reduce((sum, exp) => 
      sum + (typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount), 0);
    
    // Calculate months since goal creation for budget calculation
    const today = new Date();
    const monthsSinceCreation = 
      (today.getFullYear() - goalStartDate.getFullYear()) * 12 + 
      (today.getMonth() - goalStartDate.getMonth());
    
    // Calculate total budget allocation for this period
    const totalBudget = (monthsSinceCreation + 1) * categoryBudget.amount;
    
    // Savings = Budget allocation - Actual expenses
    const savings = totalBudget - totalExpenses;
    return Math.max(0, savings); // Ensure we don't return negative savings
  };

  const calculateProgress = (goal: Goal) => {
    // Get savings for this category
    const savings = calculateCategorySavings(goal);
    
    // Use the greater of the manually entered amount or calculated savings
    // as the current progress
    const savingsToUse = Math.max(savings, goal.current_amount);
    
    // Ensure we're dealing with numbers
    const target = typeof goal.target_amount === 'string' 
      ? parseFloat(goal.target_amount) 
      : goal.target_amount;
    
    if (target === 0) return 0; // Avoid division by zero
    return Math.min((savingsToUse / target) * 100, 100);
  };

  const generateTip = (goal: Goal) => {
    const savings = calculateCategorySavings(goal);
    const progress = calculateProgress(goal);
    const monthlyExpenses = expenses?.filter(e => e.category === goal.category)
      .reduce((sum, exp) => sum + (typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount), 0) || 0;

    if (progress < 25) {
      return monthlyExpenses > 0 
        ? `Consider reducing ${goal.category} expenses by ${Math.round((monthlyExpenses * 0.2))}$ to reach your goal faster.`
        : `Start by saving a small amount each month for your ${goal.category} goal.`;
    } else if (progress < 50) {
      return "You're making progress! Keep up the momentum by setting aside a fixed amount each month.";
    } else if (progress < 75) {
      return "You're well on your way! Consider automating your savings to reach your goal even faster.";
    } else {
      return progress === 100 
        ? "Congratulations! You've reached your goal!" 
        : "Almost there! Make one final push to reach your goal.";
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Goal deleted",
        description: "Your goal has been successfully deleted.",
      });

      queryClient.invalidateQueries({ queryKey: ["goals"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  // This function will now update goal progress with the calculated savings
  // This ensures the database reflects the automatic calculation
  const syncGoalProgress = async (goal: Goal) => {
    try {
      const savings = calculateCategorySavings(goal);
      
      // Only update if calculated savings are greater than current stored amount
      if (savings > goal.current_amount) {
        const { error } = await supabase
          .from('goals')
          .update({ current_amount: savings })
          .eq('id', goal.id);

        if (error) throw error;
        
        // Quietly refresh data
        queryClient.invalidateQueries({ queryKey: ["goals"] });
      }
    } catch (error) {
      console.error("Failed to sync goal progress:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground">Track and manage your financial targets</p>
          </div>
          <Button onClick={() => {
            setSelectedGoal(null);
            setShowGoalForm(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals?.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No goals yet. Click "Add Goal" to create your first financial goal!</p>
            </div>
          ) : (
            goals?.map((goal) => {
              // Sync goal progress with calculated savings
              syncGoalProgress(goal);
              
              const progress = calculateProgress(goal);
              const isOffTrack = progress < 30;
              const tip = generateTip(goal);
              const formattedProgress = Math.round(progress);
              const savings = calculateCategorySavings(goal);
              
              return (
                <Card key={goal.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className={progress >= 100 ? "text-yellow-500" : "text-muted-foreground"} />
                        {goal.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <span className="sr-only">Delete</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>
                    <CardDescription>
                      Target: ${goal.target_amount.toLocaleString()}
                      <br />
                      Deadline: {format(parseISO(goal.deadline), 'MMM dd, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress ({formattedProgress}%)</span>
                        <span>${Math.max(savings, goal.current_amount).toLocaleString()} of ${goal.target_amount.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={progress} 
                        indicatorClassName={progress >= 100 
                          ? "bg-green-500" 
                          : progress > 50 
                            ? "bg-primary" 
                            : progress > 25 
                              ? "bg-amber-500" 
                              : "bg-red-500"
                        } 
                      />
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>Based on your {goal.category} category savings since {format(new Date(goal.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>

                    {isOffTrack && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          You're falling behind on this goal. Consider adjusting your spending habits.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert>
                      <AlertDescription>{tip}</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              );
            })
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
