import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  PageHeader, 
  PageHeaderTitle, 
  PageHeaderDescription, 
  PageHeaderActions 
} from "@/components/ui/page-header";

interface GoalsHeaderProps {
  onCreateGoal: () => void;
}

export function GoalsHeader({ onCreateGoal }: GoalsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <PageHeader variant="simple">
        <PageHeaderTitle gradient>Goals</PageHeaderTitle>
        <PageHeaderDescription>Track your financial targets</PageHeaderDescription>
      </PageHeader>
      <PageHeaderActions>
        <Button 
          onClick={onCreateGoal} 
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </PageHeaderActions>
    </div>
  );
}
