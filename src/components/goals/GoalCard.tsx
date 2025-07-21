
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Target, TrendingUp, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import { CurrencyCode } from "@/utils/currencyUtils";

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

interface GoalCardProps {
  goal: Goal;
  savings: number;
  progress: number;
  tip: string;
  hasBudget: boolean;
  currencyCode: string;
  onDelete: (goalId: string) => void;
}

export function GoalCard({ 
  goal, 
  savings, 
  progress, 
  tip, 
  hasBudget, 
  currencyCode, 
  onDelete 
}: GoalCardProps) {
  const formattedProgress = Math.round(progress);
  const isOverspent = savings < 0;

  return (
    <Card className="p-4 hover:shadow-sm transition-shadow border border-border/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground">{goal.title}</h3>
            {progress >= 100 && (
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{goal.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{formattedProgress}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(goal.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Progress 
          value={progress} 
          className="h-1.5"
          indicatorClassName={
            progress >= 100 ? "bg-green-500" : 
            progress > 50 ? "bg-primary" : "bg-muted-foreground"
          } 
        />

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Saved: </span>
            <span className="font-medium">
              {formatCurrency(Math.max(0, savings), currencyCode as CurrencyCode)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Target: </span>
            <span className="font-medium">
              {formatCurrency(goal.target_amount, currencyCode as CurrencyCode)}
            </span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Due {format(parseISO(goal.deadline), 'MMM dd, yyyy')}
        </div>

        {!hasBudget && (
          <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
            Set a budget for {goal.category} to track progress
          </div>
        )}

        {progress >= 100 && (
          <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded">
            🎉 Goal achieved!
          </div>
        )}
      </div>
    </Card>
  );
}
