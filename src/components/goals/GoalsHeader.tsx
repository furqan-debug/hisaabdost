
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";

interface GoalsHeaderProps {
  onCreateGoal: () => void;
}

export function GoalsHeader({ onCreateGoal }: GoalsHeaderProps) {
  return (
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
        onClick={onCreateGoal} 
        size="lg"
        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="mr-2 h-5 w-5" />
        Create New Goal
      </Button>
    </div>
  );
}
