
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

// Memoize each nav item to prevent re-renders
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
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Use ref to prevent excessive render cycles from scroll events
  const lastScrollUpdate = useRef<number>(0);
  const lastScrollY = useRef<number>(0);
  
  useEffect(() => {
    setMounted(true);
    
    // Super-optimized passive scroll handler
    const handleScroll = () => {
      // Skip scroll handling if we've updated recently
      const now = Date.now();
      if (now - lastScrollUpdate.current < 500) {
        return;
      }
      
      // Only update if scroll position has changed significantly
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
        return;
      }
      
      // Only update state if the value would actually change
      const shouldBeScrolled = currentScrollY > 20;
      if (isScrolled !== shouldBeScrolled) {
        setIsScrolled(shouldBeScrolled);
      }
      
      lastScrollY.current = currentScrollY;
      lastScrollUpdate.current = now;
    };
    
    // Use passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isScrolled]);

  if (!isMobile || !mounted) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t w-full bottom-nav-shadow",
      isScrolled 
        ? "border-border/40 bg-black/95 backdrop-blur-xl" 
        : "border-border/20 bg-black/90 backdrop-blur-lg"
    )}>
      <div className="flex h-14 items-center justify-around px-1 max-w-[480px] mx-auto">
        {navItems.map((item) => (
          <NavItem 
            key={item.path}
            item={item} 
            isActive={location.pathname === item.path} 
          />
        ))}
      </div>
    </div>
  );
});

BottomNavigation.displayName = 'BottomNavigation';
