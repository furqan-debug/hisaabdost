
import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-background">
      <div className="space-y-3 text-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
