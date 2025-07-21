
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

interface GoalsEmptyStateProps {
  onCreateGoal: () => void;
}

export function GoalsEmptyState({ onCreateGoal }: GoalsEmptyStateProps) {
  return (
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
          onClick={onCreateGoal}
          variant="outline"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Get Started
        </Button>
      </div>
    </div>
  );
}
