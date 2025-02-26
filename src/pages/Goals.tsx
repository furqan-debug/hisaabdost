
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

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

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
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
    enabled: !!user,
  });

  const calculateProgress = (goal: Goal) => {
    return (goal.current_amount / goal.target_amount) * 100;
  };

  const generateTip = (goal: Goal) => {
    const progress = calculateProgress(goal);
    const monthlyExpenses = expenses?.filter(e => e.category === goal.category)
      .reduce((sum, exp) => sum + exp.amount, 0) || 0;

    if (progress < 25) {
      return `Consider reducing ${goal.category} expenses by ${monthlyExpenses > 0 ? Math.round((monthlyExpenses * 0.2)) : 20}% to reach your goal faster.`;
    } else if (progress < 50) {
      return "You're making progress! Keep up the momentum by setting aside a fixed amount each month.";
    } else if (progress < 75) {
      return "You're well on your way! Consider automating your savings to reach your goal even faster.";
    } else {
      return "Almost there! Make one final push to reach your goal.";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
        {goals?.map((goal) => {
          const progress = calculateProgress(goal);
          const isOffTrack = progress < 30;
          const tip = generateTip(goal);

          return (
            <Card key={goal.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className={progress >= 100 ? "text-yellow-500" : "text-muted-foreground"} />
                  {goal.title}
                </CardTitle>
                <CardDescription>
                  Target: ${goal.target_amount.toLocaleString()}
                  <br />
                  Deadline: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress ({Math.round(progress)}%)</span>
                    <span>${goal.current_amount.toLocaleString()} of ${goal.target_amount.toLocaleString()}</span>
                  </div>
                  <Progress value={progress} />
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
        })}
      </div>
    </div>
  );
}
