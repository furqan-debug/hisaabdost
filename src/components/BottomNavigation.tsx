
import { useLocation, Link } from "react-router-dom";
import { Home, Receipt, Wallet, BarChart2, Target } from "lucide-react";
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
}];

export function BottomNavigation() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Check if current route shows ads
  const isMainTabRoute = ['/app/dashboard', '/app/expenses', '/app/budget', '/app/analytics', '/app/goals'].includes(location.pathname);
  
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!isMobile || !mounted) return null;
  
  return (
    <div className={cn(
      "fixed left-0 right-0 z-50 border-t transition-all duration-300 w-full",
      // Position above banner ads with proper spacing
      isMainTabRoute ? "bottom-14" : "bottom-0",
      isScrolled ? "border-border/40 bg-background/95 backdrop-blur-xl shadow-lg" : "border-border/20 bg-background/90 backdrop-blur-lg"
    )}>
      <div className="flex h-16 items-center justify-around max-w-[480px] py-2 mx-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="w-1/5">
              <div className={cn(
                "menu-item flex flex-col items-center justify-center h-12 transition-colors duration-300 rounded-lg",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/50"
              )}>
                <div className="relative">
                  <item.icon size={22} className={cn(
                    "transition-all duration-300",
                    isActive ? "text-primary scale-110" : "text-muted-foreground/70"
                  )} />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium mt-1 transition-colors duration-300",
                  isActive ? "text-primary" : ""
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
