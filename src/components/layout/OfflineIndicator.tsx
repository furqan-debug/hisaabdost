import { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw, AlertCircle } from "lucide-react";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useOfflineData } from "@/hooks/useOfflineData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const { isOnline, updateAvailable, updateApp } = useServiceWorker();
  const { pendingSyncCount, syncInProgress, syncPendingData, lastSyncTime } = useOfflineData();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Show indicator when offline or when there are pending syncs
    setShowIndicator(!isOnline || pendingSyncCount > 0 || updateAvailable);
  }, [isOnline, pendingSyncCount, updateAvailable]);

  useEffect(() => {
    // Show toast when going offline/online
    if (!isOnline) {
      toast.info("You're offline. Your data will sync when you're back online.", {
        duration: 3000,
      });
    } else if (pendingSyncCount > 0) {
      toast.success(`Back online! Syncing ${pendingSyncCount} pending changes...`, {
        duration: 3000,
      });
    }
  }, [isOnline, pendingSyncCount]);

  if (!showIndicator) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      "bg-background/95 backdrop-blur border-b shadow-sm"
    )}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {!isOnline ? (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600 font-medium">Offline Mode</span>
                <span className="text-muted-foreground">
                  Your changes will sync when you're back online
                </span>
              </>
            ) : pendingSyncCount > 0 ? (
              <>
                <RefreshCw className={cn(
                  "h-4 w-4 text-blue-500",
                  syncInProgress && "animate-spin"
                )} />
                <span className="text-blue-600 font-medium">
                  {syncInProgress ? "Syncing..." : `${pendingSyncCount} changes pending`}
                </span>
                {!syncInProgress && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={syncPendingData}
                    className="h-6 px-2 text-xs"
                  >
                    Sync Now
                  </Button>
                )}
              </>
            ) : updateAvailable ? (
              <>
                <AlertCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">Update Available</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={updateApp}
                  className="h-6 px-2 text-xs"
                >
                  Update Now
                </Button>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">Online</span>
                {lastSyncTime && (
                  <span className="text-muted-foreground">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </span>
                )}
              </>
            )}
          </div>

          {showIndicator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIndicator(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}