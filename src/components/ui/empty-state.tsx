
import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 border border-border/30 rounded-lg bg-card/40 backdrop-blur-sm shadow-sm text-center">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
