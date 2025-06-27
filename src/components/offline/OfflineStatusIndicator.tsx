
import React from 'react';
import { useOffline } from './OfflineProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineStatusIndicator() {
  const { isOnline, hasPendingSync, syncInProgress, triggerSync } = useOffline();

  if (isOnline && !hasPendingSync && !syncInProgress) {
    return null; // Don't show anything when online and no pending sync
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Network status */}
      <Badge 
        variant={isOnline ? "default" : "destructive"} 
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5",
          isOnline ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
        )}
      >
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isOnline ? 'Online' : 'Offline'}
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
        >
          <Upload className="h-3 w-3 mr-1" />
          Sync Now
        </Button>
      )}
    </div>
  );
}
