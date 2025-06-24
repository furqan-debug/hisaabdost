
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Target, TrendingUp, Calendar, DollarSign, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
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
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
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
            onClick={() => onDelete(goal.id)}
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
}
