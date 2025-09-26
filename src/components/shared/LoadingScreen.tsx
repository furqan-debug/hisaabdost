
import React from 'react';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';

interface LoadingScreenProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function LoadingScreen({ message = "Loading...", showRetry, onRetry }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <EnhancedLoading 
        message={message} 
        showRetry={showRetry}
        onRetry={onRetry}
        timeout={8000}
      />
    </div>
  );
}
