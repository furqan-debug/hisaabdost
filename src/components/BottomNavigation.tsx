
import { useLocation, Link } from "react-router-dom";
import { Home, Receipt, Wallet, BarChart2, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: Wallet, label: "Budget", path: "/budget" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: Target, label: "Goals", path: "/goals" },
];

const NavItem = memo(({ 
  item, 
  isActive 
}: { 
  item: typeof navItems[0], 
  isActive: boolean 
}) => (
  <Link key={item.path} to={item.path} className="w-1/5">
    <div
      className={cn(
        "menu-item flex flex-col items-center justify-center h-12",
        isActive ? "text-primary" : "text-muted-foreground/60"
      )}
    >
      <item.icon 
        size={20} 
        className={isActive ? "text-primary" : "text-muted-foreground/70"} 
      />
      <span 
        className={cn(
          "text-[10px] font-medium mt-1",
          isActive ? "text-primary" : ""
        )}
      >
        {item.label}
      </span>
    </div>
  </Link>
));

export const BottomNavigation = memo(() => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bottom-navigation-wrapper">
      <nav className="fixed bottom-0 left-0 right-0 w-full z-[999] border-t bg-background/95 backdrop-blur-xl bottom-nav-shadow">
        <div className="flex h-14 items-center justify-around px-1 max-w-[480px] mx-auto">
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              item={item} 
              isActive={location.pathname === item.path} 
            />
          ))}
        </div>
      </nav>
    </div>
  );
});

BottomNavigation.displayName = 'BottomNavigation';
