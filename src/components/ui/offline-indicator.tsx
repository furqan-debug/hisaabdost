
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOffline } from "@/hooks/useOffline";

export function OfflineIndicator() {
  const { isOnline, isOffline, syncData, pendingSync } = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Changes will be saved locally.</span>
          </div>
        </motion.div>
      )}
      
      {isOnline && pendingSync && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Syncing offline changes...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OfflineStatus() {
  const { isOnline, isOffline, syncData, pendingSync } = useOffline();

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="h-4 w-4" />
          <span className="text-xs">Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-xs">Offline</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={syncData}
            disabled={pendingSync || isOffline}
            className="h-6 px-2 text-xs"
          >
            {pendingSync ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              'Sync'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
