import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedLoadingProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  variant?: 'spinner' | 'skeleton' | 'pulse';
  timeout?: number;
  className?: string;
}

export function EnhancedLoading({ 
  message = "Loading...", 
  showRetry = false,
  onRetry,
  variant = 'spinner',
  timeout = 10000,
  className 
}: EnhancedLoadingProps) {
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (variant === 'skeleton') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="animate-pulse bg-muted h-4 rounded w-3/4"></div>
        <div className="animate-pulse bg-muted h-4 rounded w-1/2"></div>
        <div className="animate-pulse bg-muted h-4 rounded w-2/3"></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("animate-pulse bg-muted rounded-md", className)} />
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
      
      {(showTimeout || showRetry) && onRetry && (
        <div className="flex flex-col items-center space-y-2">
          <p className="text-xs text-muted-foreground">Taking longer than expected</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}