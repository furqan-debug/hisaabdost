
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

interface GoalsEmptyStateProps {
  onCreateGoal: () => void;
}

export function GoalsEmptyState({ onCreateGoal }: GoalsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Target className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No goals yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Create your first financial goal to start tracking your progress
      </p>
      <Button 
        onClick={onCreateGoal}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Goal
      </Button>
    </div>
  );
}
