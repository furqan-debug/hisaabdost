
import React from 'react';
import { useOffline } from './OfflineProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, Upload, Loader2, Signal, SignalLow } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineStatusIndicator() {
  const { isOnline, hasPendingSync, syncInProgress, triggerSync } = useOffline();
  const { connectionQuality } = useNetworkStatus();

  if (isOnline && !hasPendingSync && !syncInProgress) {
    return null; // Don't show anything when online and no pending sync
  }

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    
    if (connectionQuality === 'slow') {
      return <SignalLow className="h-3 w-3" />;
    }
    
    return <Wifi className="h-3 w-3" />;
  };

  const getConnectionText = () => {
    if (!isOnline) return 'Offline';
    if (connectionQuality === 'slow') return 'Slow Connection';
    return 'Online';
  };

  const getConnectionColor = () => {
    if (!isOnline) return "bg-red-500 hover:bg-red-600";
    if (connectionQuality === 'slow') return "bg-yellow-500 hover:bg-yellow-600";
    return "bg-green-500 hover:bg-green-600";
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Network status */}
      <Badge 
        variant={isOnline ? "default" : "destructive"} 
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5",
          getConnectionColor()
        )}
      >
        {getConnectionIcon()}
        {getConnectionText()}
      </Badge>

      {/* Sync status */}
      {(hasPendingSync || syncInProgress) && (
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
          {syncInProgress ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3" />
              {hasPendingSync ? 'Pending sync' : 'Synced'}
            </>
          )}
        </Badge>
      )}

      {/* Manual sync button */}
      {isOnline && hasPendingSync && !syncInProgress && (
        <Button
          size="sm"
          variant="outline"
          onClick={triggerSync}
          className="px-3 py-1.5 h-auto"
          disabled={connectionQuality === 'slow'}
        >
          <Upload className="h-3 w-3 mr-1" />
          {connectionQuality === 'slow' ? 'Wait...' : 'Sync Now'}
        </Button>
      )}
    </div>
  );
}
