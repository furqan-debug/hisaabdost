
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
    <div className="fixed left-0 right-0 bottom-0 z-50 bg-white dark:bg-card border-t border-border/20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] w-full">
      <div className="flex h-16 items-center justify-around max-w-[480px] py-1 mx-auto px-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex-1 max-w-[80px]">
              <div className={cn(
                "flex flex-col items-center justify-center h-14 transition-all duration-200 rounded-xl",
                isActive ? "text-primary scale-105" : "text-muted-foreground/70 hover:text-foreground"
              )}>
                <div className="relative mb-0.5">
                  <item.icon size={24} className={cn(
                    "transition-all duration-200",
                    isActive ? "text-primary" : ""
                  )} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[11px] font-medium transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/70"
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
