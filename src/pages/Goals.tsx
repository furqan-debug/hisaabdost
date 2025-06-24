import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, AlertTriangle, Target, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, startOfMonth, endOfMonth, parseISO, isAfter, isSameMonth, isBefore, subMonths, subDays } from "date-fns";
import { GoalForm } from "@/components/goals/GoalForm";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

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
  const { currencyCode } = useCurrency();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(Date.now());

  // Listen for goal update events from Finny
  useEffect(() => {
    const handleGoalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail || {};
      const isFinnyEvent = detail.source === 'finny-chat';
      
      console.log("Goal update detected, immediate refresh", e, { isFinnyEvent });
      
      if (isFinnyEvent) {
        console.log("IMMEDIATE goal refresh for Finny event");
        
        // Force immediate invalidation and refetch for Finny events
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        queryClient.refetchQueries({ queryKey: ['goals', user?.id] });
        
        // Update refresh trigger immediately
        setRefreshTrigger(Date.now());
        
        // Additional refresh after short delay to ensure backend processing is complete
        setTimeout(() => {
          console.log("Secondary goal refresh for Finny event");
          queryClient.refetchQueries({ queryKey: ['goals', user?.id] });
          setRefreshTrigger(Date.now());
        }, 300);
      } else {
        // Standard refresh for other events
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        
        // Update refresh trigger
        setRefreshTrigger(Date.now());
        
        // Force a refetch after a short delay
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['goals', user?.id] });
        }, 100);
      }
    };
    
    const eventTypes = [
      'goal-updated',
      'goal-deleted',
      'goals-refresh',
      'goal-added'
    ];
    
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleGoalUpdate);
    });
    
    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleGoalUpdate);
      });
    };
  }, [queryClient, user?.id]);

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
    staleTime: 0, // Always consider data stale to force refresh
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Fetch all expenses for use in savings calculations
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
    enabled: !!user
  });

  // Calculate category savings since goal creation
  const calculateCategorySavings = (goal: Goal) => {
    if (!expenses || !budgets) return 0;

    // Get budget for this category
    const categoryBudget = budgets.find(b => b.category === goal.category);
    if (!categoryBudget) return 0; // No budget for this category

    // Get current month's start and end
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Get expenses for this category in the current month
    const currentMonthExpenses = expenses.filter(e => 
      e.category === goal.category && isSameMonth(new Date(e.date), now)
    );

    // Calculate total expenses for this category in the current month
    const totalExpenses = currentMonthExpenses.reduce((sum, exp) => 
      sum + (typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount), 0
    );

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
    const target = typeof goal.target_amount === 'string' ? parseFloat(goal.target_amount) : goal.target_amount;
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
      return `You've overspent your ${goal.category} budget by ${formatCurrency(Math.abs(savings), currencyCode)}. Try to reduce spending to get back on track.`;
    }

    // Progress tips based on percentage
    if (progress < 25) {
      return `Focus on reducing your ${goal.category} spending to increase your savings. Try to save at least ${formatCurrency(goal.target_amount * 0.25, currencyCode)} this month.`;
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
        description: "Your goal has been successfully deleted."
      });

      queryClient.invalidateQueries({ queryKey: ["goals"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the goal. Please try again.",
        variant: "destructive"
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
          {/* Enhanced Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Financial Goals
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Set ambitious targets, track your progress, and achieve your financial dreams
            </p>
            <Button 
              onClick={() => {
                setSelectedGoal(null);
                setShowGoalForm(true);
              }} 
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Goal
            </Button>
          </div>

          {/* Goals Grid */}
          {goals?.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-32 h-32 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
                  <Target className="h-16 w-16 text-muted-foreground/50" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-muted-foreground">No Goals Yet</h3>
                  <p className="text-muted-foreground">
                    Start your journey by creating your first financial goal. Every big achievement begins with a clear target!
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedGoal(null);
                    setShowGoalForm(true);
                  }}
                  variant="outline"
                  size="lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {goals?.map((goal) => {
                // Sync goal progress with calculated savings
                syncGoalProgress(goal);

                const savings = calculateCategorySavings(goal);
                const progress = calculateProgress(goal);
                const formattedProgress = Math.round(progress);
                const tip = generateTip(goal);
                const isOverspent = savings < 0;
                const hasBudget = budgets?.some(b => b.category === goal.category && b.amount > 0) ?? false;

                return (
                  <Card key={goal.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                    {/* Progress Ring Background */}
                    <div className="absolute top-4 right-4 w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-muted/20"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray={`${(progress / 100) * 176} 176`}
                          className={
                            isOverspent ? "text-destructive" : 
                            progress >= 100 ? "text-green-500" : 
                            progress > 50 ? "text-primary" : 
                            progress > 25 ? "text-amber-500" : "text-red-500"
                          }
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">{formattedProgress}%</span>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between pr-20">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <div className={`p-2 rounded-lg ${
                              progress >= 100 ? "bg-green-100 text-green-600" : 
                              progress > 50 ? "bg-primary/10 text-primary" : 
                              "bg-muted text-muted-foreground"
                            }`}>
                              {progress >= 100 ? (
                                <Trophy className="h-4 w-4" />
                              ) : (
                                <Target className="h-4 w-4" />
                              )}
                            </div>
                            <span className="font-semibold">{goal.title}</span>
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatCurrency(goal.target_amount, currencyCode)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(parseISO(goal.deadline), 'MMM dd')}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <span className="sr-only">Delete</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Progress</p>
                            <p className="text-lg font-semibold">
                              {isOverspent ? (
                                <span className="text-destructive flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4 rotate-180" />
                                  -{formatCurrency(Math.abs(savings), currencyCode)}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  {formatCurrency(Math.max(0, savings), currencyCode)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="text-sm font-medium">{goal.category}</p>
                          </div>
                        </div>
                        
                        {!hasBudget ? (
                          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-700 dark:text-amber-400">
                              Set a budget for {goal.category} to track progress automatically
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <>
                            <Progress 
                              value={progress} 
                              className="h-2"
                              indicatorClassName={
                                isOverspent ? "bg-destructive" : 
                                progress >= 100 ? "bg-green-500" : 
                                progress > 50 ? "bg-primary" : 
                                progress > 25 ? "bg-amber-500" : "bg-red-500"
                              } 
                            />
                            <p className="text-xs text-muted-foreground">
                              Based on {goal.category} budget savings this month
                            </p>
                          </>
                        )}
                      </div>

                      {/* Status Alerts */}
                      {isOverspent && (
                        <Alert variant="destructive" className="border-destructive/20">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Budget exceeded. Reduce {goal.category} spending to resume progress.
                          </AlertDescription>
                        </Alert>
                      )}

                      {progress >= 100 && (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700 dark:text-green-400 text-sm">
                            🎉 Congratulations! Goal achieved!
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Tip Section */}
                      <div className="p-3 rounded-lg bg-muted/50 border border-muted/30">
                        <p className="text-xs text-muted-foreground font-medium mb-1">💡 Smart Tip</p>
                        <p className="text-sm">{tip}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
