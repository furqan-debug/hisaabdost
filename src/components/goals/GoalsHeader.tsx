
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

interface GoalsHeaderProps {
  onCreateGoal: () => void;
}

export function GoalsHeader({ onCreateGoal }: GoalsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Goals</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your financial targets</p>
      </div>
      <Button 
        onClick={onCreateGoal} 
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Goal
      </Button>
    </div>
  );
}
