
import { useLocation, Link } from "react-router-dom";
import { Home, Receipt, Wallet, MoreHorizontal, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreSheet } from "./navigation/MoreSheet";

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
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!isMobile || !mounted) return null;

  const handleAddExpense = () => {
    window.dispatchEvent(new CustomEvent('open-expense-form', { 
      detail: { mode: 'manual' }
    }));
  };
  
  return (
    <>
      <div className="fixed left-0 right-0 bottom-0 z-50 bg-gradient-to-t from-background via-background/98 to-background/95 backdrop-blur-xl border-t-2 border-border/30 w-full shadow-[0_-2px_10px_rgba(0,0,0,0.03)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="relative grid grid-cols-5 h-16 items-center max-w-[480px] mx-auto px-2">
          {/* First 2 items: Home, Expenses */}
          {navItems.slice(0, 2).map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.label} className="flex items-center justify-center">
                <Link to={item.path!} className="w-full flex items-center justify-center">
                  <div className={cn(
                    "relative flex flex-col items-center justify-center gap-1.5 px-2 py-2 transition-all duration-200 active:scale-95",
                    isActive && "scale-105"
                  )}>
                    <item.icon 
                      size={24} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={cn(
                        "transition-all duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className={cn(
                      "text-[11px] font-medium leading-none transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full animate-scale-in" />
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
          
          {/* Center FAB - independent column */}
          <div className="flex items-center justify-center">
            <Button
              onClick={handleAddExpense}
              size="icon"
              className="absolute left-1/2 -translate-x-1/2 -top-8 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/50 hover:shadow-primary/60 hover:scale-110 active:scale-95 active:ring-4 active:ring-primary/30 transition-all duration-200 z-10 animate-pulse-subtle"
            >
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </Button>
          </div>
          
          {/* Last 2 items: Budget, More */}
          {navItems.slice(2, 4).map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.label} className="flex items-center justify-center">
                {item.path ? (
                  <Link to={item.path} className="w-full flex items-center justify-center">
                    <div className={cn(
                      "relative flex flex-col items-center justify-center gap-1.5 px-2 py-2 transition-all duration-200 active:scale-95",
                      isActive && "scale-105"
                    )}>
                      <item.icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={cn(
                          "transition-all duration-200",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className={cn(
                        "text-[11px] font-medium leading-none transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                      {/* Active indicator line */}
                      {isActive && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full animate-scale-in" />
                      )}
                    </div>
                  </Link>
                ) : (
                  <button 
                    onClick={() => setMoreSheetOpen(true)}
                    className="w-full flex items-center justify-center"
                  >
                    <div className="relative flex flex-col items-center justify-center gap-1.5 px-2 py-2 transition-all duration-200 active:scale-95">
                      <item.icon 
                        size={24} 
                        strokeWidth={2} 
                        className="text-muted-foreground transition-all duration-200"
                      />
                      <span className="text-[11px] font-medium leading-none text-muted-foreground transition-colors duration-200">
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
      
      <MoreSheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen} />
    </>
  );
}
