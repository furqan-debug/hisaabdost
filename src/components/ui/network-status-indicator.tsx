
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Signal, SignalLow } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

interface NetworkStatusIndicatorProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function NetworkStatusIndicator({ 
  className, 
  showText = true, 
  size = 'md' 
}: NetworkStatusIndicatorProps) {
  const { 
    isOnline, 
    isSlowConnection, 
    connectionType, 
    effectiveType,
    wasOffline 
  } = useNetworkStatus();

  const getIcon = () => {
    if (!isOnline) {
      return <WifiOff className={cn(
        size === 'sm' ? 'h-3 w-3' : 
        size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
      )} />;
    }
    
    if (isSlowConnection) {
      return <SignalLow className={cn(
        size === 'sm' ? 'h-3 w-3' : 
        size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
      )} />;
    }
    
    return <Wifi className={cn(
      size === 'sm' ? 'h-3 w-3' : 
      size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
    )} />;
  };

  const getVariant = () => {
    if (!isOnline) return 'destructive';
    if (isSlowConnection) return 'secondary';
    if (wasOffline) return 'default';
    return 'outline';
  };

  const getText = () => {
    if (!isOnline) return 'Offline';
    if (wasOffline) return 'Back Online';
    if (isSlowConnection) return 'Slow Connection';
    return 'Online';
  };

  const getDetailedText = () => {
    if (!isOnline) return 'Working offline - changes will sync when connected';
    if (isSlowConnection) return `${effectiveType.toUpperCase()} connection - syncing may be slower`;
    return `Connected via ${connectionType}`;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge 
        variant={getVariant()}
        className={cn(
          'flex items-center gap-1 transition-all duration-300',
          size === 'sm' && 'text-xs px-2 py-1',
          size === 'lg' && 'text-sm px-3 py-2',
          wasOffline && 'animate-pulse'
        )}
      >
        {getIcon()}
        {showText && (
          <span className={cn(
            size === 'sm' && 'text-xs',
            size === 'lg' && 'text-sm'
          )}>
            {getText()}
          </span>
        )}
      </Badge>
      
      {/* Tooltip-like detailed info */}
      <div className="hidden group-hover:block absolute z-50 bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
        {getDetailedText()}
      </div>
    </div>
  );
}
