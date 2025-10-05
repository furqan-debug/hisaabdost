
import { useLocation, Link } from "react-router-dom";
import { Home, Receipt, Wallet, BarChart2, Target, HandCoins } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
  icon: BarChart2,
  label: "Analytics",
  path: "/app/analytics"
}, {
  icon: Target,
  label: "Goals",
  path: "/app/goals"
}, {
  icon: HandCoins,
  label: "Loans",
  path: "/app/loans"
}];

export function BottomNavigation() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!isMobile || !mounted) return null;
  
  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex h-16 items-center justify-around max-w-[480px] mx-auto px-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex-1 flex items-center justify-center">
              <div className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-colors duration-150",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground active:bg-muted/50"
              )}>
                <item.icon 
                  size={22} 
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
          );
        })}
      </div>
    </div>
  );
}
