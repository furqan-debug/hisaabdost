
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, startOfMonth, endOfMonth, parseISO, isAfter, isBefore, isSameMonth } from "date-fns";
import { GoalForm } from "@/components/goals/GoalForm";
import { useMonthContext } from "@/hooks/use-month-context";

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
  const { selectedMonth } = useMonthContext();
  
  // Define month boundaries for filtering
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const formattedMonthStart = format(monthStart, 'yyyy-MM-dd');
  const formattedMonthEnd = format(monthEnd, 'yyyy-MM-dd');
  const monthKey = format(selectedMonth, 'yyyy-MM');

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', user?.id, monthKey],
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

  // Fetch expenses for the selected month for use in savings calculations
  const { data: expenses } = useQuery({
    queryKey: ['expenses', monthKey, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', formattedMonthStart)
        .lte('date', formattedMonthEnd);

      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} expenses for goals calculation: ${format(selectedMonth, 'MMMM yyyy')}`);
      return data;
    },
    enabled: !!user,
  });

  // Fetch budgets for the selected month to calculate savings
  const { data: budgets } = useQuery({
    queryKey: ['budgets', monthKey, user?.id],
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
  
  // Force a refresh when selected month changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['goals', user?.id, monthKey] });
    queryClient.invalidateQueries({ queryKey: ['expenses', monthKey, user?.id] });
    queryClient.invalidateQueries({ queryKey: ['budgets', monthKey, user?.id] });
  }, [selectedMonth, monthKey, queryClient, user?.id]);

  // Calculate category savings for the selected month
  const calculateCategorySavings = (goal: Goal) => {
    if (!expenses || !budgets) return 0;
    
    // Get budget for this category
    const categoryBudget = budgets.find(b => b.category === goal.category);
    if (!categoryBudget) return 0; // No budget for this category
    
    // Get expenses for this category in the current month (already filtered by month)
    const categoryExpenses = expenses.filter(e => e.category === goal.category);
    
    // Calculate total expenses for this category in the current month
    const totalExpenses = categoryExpenses.reduce((sum, exp) => 
      sum + (typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount), 0);
    
    // Calculate monthly budget
    const monthlyBudget = categoryBudget.amount;
    
    // Calculate savings = Budget - Expenses (can be negative if overspent)
    const savings = monthlyBudget - totalExpenses;
    
    // Return savings (which can be negative if overspent)
    return savings;
  };

  const calculateProgress = (goal: Goal) => {
    // Get savings for this category
    const savings = calculateCategorySavings(goal);
    
    // If savings is negative (overspent), return 0% progress
    if (savings <= 0) return 0;
    
    // Calculate progress as (savings / target_amount) * 100
    const target = typeof goal.target_amount === 'string' 
      ? parseFloat(goal.target_amount) 
      : goal.target_amount;
    
    if (target === 0) return 0; // Avoid division by zero
    
    // Cap progress at 100%
    return Math.min((savings / target) * 100, 100);
  };

  const generateTip = (goal: Goal) => {
    const savings = calculateCategorySavings(goal);
    const progress = calculateProgress(goal);
    const categoryBudget = budgets?.find(b => b.category === goal.category);
    const monthlyBudget = categoryBudget ? categoryBudget.amount : 0;
    
    // Handle case where there's no budget set for this category
    if (!categoryBudget || monthlyBudget === 0) {
      return "Set a monthly budget for this category to start tracking your savings progress.";
    }
    
    // If savings are negative (overspent)
    if (savings < 0) {
      return `You've overspent your ${goal.category} budget by $${Math.abs(savings).toFixed(2)}. Try to reduce spending to get back on track.`;
    }
    
    // Progress tips based on percentage
    if (progress < 25) {
      return `Focus on reducing your ${goal.category} spending to increase your savings. Try to save at least $${(goal.target_amount * 0.25).toFixed(2)} this month.`;
    } else if (progress < 50) {
      return "You're making progress! Keep reducing expenses to reach your goal faster.";
    } else if (progress < 75) {
      return "Great progress! You're well on your way to reaching your goal.";
    } else if (progress < 100) {
      return "Almost there! Just a little more savings to reach your target.";
    } else {
      return "Congratulations! You've reached your savings goal!";
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

  // This function will update goal progress in the database based on actual savings
  const syncGoalProgress = async (goal: Goal) => {
    try {
      const savings = calculateCategorySavings(goal);
      
      // We don't store negative values in the database
      const savingsToStore = Math.max(0, savings);
      
      // Update only if savings are different from what's stored
      if (Math.abs(savingsToStore - goal.current_amount) > 0.01) {
        const { error } = await supabase
          .from('goals')
          .update({ current_amount: savingsToStore })
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
    return <div className="animate-pulse p-8 text-center">Loading your financial goals...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground">
              Track and manage your financial targets for {format(selectedMonth, 'MMMM yyyy')}
            </p>
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
              // Use calculations based on selected month data
              const savings = calculateCategorySavings(goal);
              const progress = calculateProgress(goal);
              const formattedProgress = Math.round(progress);
              const tip = generateTip(goal);
              const isOverspent = savings < 0;
              const hasBudget = budgets?.some(b => b.category === goal.category && b.amount > 0) ?? false;
              
              // Update goal progress in UI only (no DB write for performance)
              const currentProgress = Math.max(0, savings);
              
              return (
                <Card key={goal.id} className="relative">
                  <div className="absolute top-2 right-2 px-2 py-1 bg-primary/10 text-xs rounded text-primary">
                    {format(selectedMonth, 'MMM yyyy')}
                  </div>
                  <CardHeader className="pt-6">
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
                        <span>
                          {isOverspent ? (
                            <span className="text-destructive">-${Math.abs(savings).toFixed(2)}</span>
                          ) : (
                            `$${Math.max(0, savings).toFixed(2)} of $${goal.target_amount.toLocaleString()}`
                          )}
                        </span>
                      </div>
                      
                      {!hasBudget ? (
                        <Alert>
                          <AlertDescription className="text-amber-500">
                            No budget set for {goal.category}. Set a budget to track progress.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Progress 
                          value={progress} 
                          indicatorClassName={
                            isOverspent 
                              ? "bg-destructive" 
                              : progress >= 100 
                                ? "bg-green-500" 
                                : progress > 50 
                                  ? "bg-primary" 
                                  : progress > 25 
                                    ? "bg-amber-500" 
                                    : "bg-red-500"
                          } 
                        />
                      )}
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>Based on {goal.category} budget savings for {format(selectedMonth, 'MMMM yyyy')}</p>
                      </div>
                    </div>

                    {isOverspent && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          You've overspent your {goal.category} budget. Progress is on hold until you start saving.
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
