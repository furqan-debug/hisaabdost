import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner
    const dismissed = localStorage.getItem('install-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show banner after a short delay if installable and not installed
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !isDismissed) {
        setShowBanner(true);
      }
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isDismissed]);

  const handleInstall = async () => {
    const success = await promptInstall();
    
    if (success) {
      toast.success("HisaabDost installed successfully!");
      setShowBanner(false);
    } else {
      toast.error("Installation cancelled or failed");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('install-banner-dismissed', 'true');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className={cn(
      "fixed bottom-20 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm",
      "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg shadow-lg",
      "border border-primary/20 backdrop-blur-sm"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-white/20 p-2">
            <Smartphone className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Install HisaabDost
            </h3>
            <p className="text-xs text-primary-foreground/90 mb-3">
              Get the full app experience with offline access and instant loading
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleInstall}
                className="text-xs h-7 bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-7 text-white hover:bg-white/10"
              >
                Later
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="p-1 h-auto text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}