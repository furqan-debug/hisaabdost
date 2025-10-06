
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
      <div className="fixed left-0 right-0 bottom-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="relative flex h-16 items-center justify-around max-w-[480px] mx-auto px-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isCenter = index === 2; // Budget is at index 2, we'll add FAB before it
            
            return (
              <div key={item.label} className="flex-1 flex items-center justify-center">
                {/* Add elevated FAB before Budget item */}
                {isCenter && (
                  <Button
                    onClick={handleAddExpense}
                    size="icon"
                    className="absolute left-1/2 -translate-x-1/2 -top-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-10 bg-primary"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                )}
                
                {item.path ? (
                  <Link to={item.path} className="flex-1 flex items-center justify-center">
                    <div className={cn(
                      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-colors duration-150",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground active:bg-muted/50"
                    )}>
                      <item.icon 
                        size={20} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className="transition-none"
                      />
                      <span className={cn(
                        "text-[10px] font-semibold leading-none",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <button 
                    onClick={() => setMoreSheetOpen(true)}
                    className="flex-1 flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-colors duration-150 text-muted-foreground active:bg-muted/50">
                      <item.icon 
                        size={20} 
                        strokeWidth={2} 
                        className="transition-none"
                      />
                      <span className="text-[10px] font-semibold leading-none text-muted-foreground">
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
