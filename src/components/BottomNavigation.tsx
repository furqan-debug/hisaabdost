import { useLocation, Link } from "react-router-dom";
import { Home, Receipt, Wallet, MoreHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreSheet } from "./navigation/MoreSheet";
import { useFinny } from "@/components/finny";

const navItems = [{
  icon: Home,
  label: "Home",
  path: "/app/dashboard"
}, {
  icon: Receipt,
  label: "Expenses",
  path: "/app/expenses"
}, {
  icon: Wallet,
  label: "Budget",
  path: "/app/budget"
}, {
  icon: MoreHorizontal,
  label: "More",
  path: null
}];

export function BottomNavigation() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const { openChat } = useFinny();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!isMobile || !mounted) return null;
  
  return (
    <>
      <div className="fixed left-0 right-0 bottom-0 z-50 w-full overflow-visible pt-16" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="relative bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl border-t-2 border-border/30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] overflow-visible">
          
          {/* Finny AI FAB - Absolutely positioned above navbar */}
          <Button
            onClick={openChat}
            size="icon"
            className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-br from-primary/90 to-primary shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-110 active:scale-95 active:ring-4 active:ring-primary/30 transition-all duration-200 border-4 border-background p-3 z-10"
          >
            <img src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png" alt="Finny AI" className="w-full h-full object-contain drop-shadow-lg" />
          </Button>

          <div className="relative grid grid-cols-5 h-16 items-center max-w-[480px] mx-auto px-2 overflow-visible">
            {/* First 2 items: Home, Expenses */}
            {navItems.slice(0, 2).map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.label} to={item.path!} className="flex items-center justify-center">
                  <div className={cn(
                    "relative flex flex-col items-center justify-center gap-1 w-full py-2 transition-all duration-200 active:scale-95",
                    isActive && "scale-105"
                  )}>
                    <item.icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={cn(
                        "transition-all duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className={cn(
                      "text-[10px] font-medium leading-none transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                    )}
                  </div>
                </Link>
              );
            })}
            
            {/* Center column - visual space for FAB */}
            <div className="flex items-center justify-center" />
            
            {/* Last 2 items: Budget, More */}
            {navItems.slice(2, 4).map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <div key={item.label} className="flex items-center justify-center">
                  {item.path ? (
                    <Link to={item.path} className="flex items-center justify-center w-full">
                      <div className={cn(
                        "relative flex flex-col items-center justify-center gap-1 w-full py-2 transition-all duration-200 active:scale-95",
                        isActive && "scale-105"
                      )}>
                        <item.icon 
                          size={22} 
                          strokeWidth={isActive ? 2.5 : 2} 
                          className={cn(
                            "transition-all duration-200",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span className={cn(
                          "text-[10px] font-medium leading-none transition-colors duration-200",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}>
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                        )}
                      </div>
                    </Link>
                  ) : (
                    <button 
                      onClick={() => setMoreSheetOpen(true)}
                      className="flex items-center justify-center w-full"
                    >
                      <div className="relative flex flex-col items-center justify-center gap-1 w-full py-2 transition-all duration-200 active:scale-95">
                        <item.icon 
                          size={22} 
                          strokeWidth={2} 
                          className="text-muted-foreground transition-all duration-200"
                        />
                        <span className="text-[10px] font-medium leading-none text-muted-foreground transition-colors duration-200">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <MoreSheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen} />
    </>
  );
}
