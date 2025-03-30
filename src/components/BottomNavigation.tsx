
import { useLocation, Link } from "react-router-dom";
import { Home, Receipt, Wallet, BarChart2, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: Wallet, label: "Budget", path: "/budget" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: Target, label: "Goals", path: "/goals" },
];

export function BottomNavigation() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const lastScrollUpdate = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    
    // Super-optimized throttled scroll handler
    const handleScroll = () => {
      // Skip scroll handling if we've updated recently (300ms)
      const now = Date.now();
      if (now - lastScrollUpdate.current < 300) {
        return;
      }
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = window.setTimeout(() => {
        // Only update state if the value would actually change
        const shouldBeScrolled = window.scrollY > 20;
        if (isScrolled !== shouldBeScrolled) {
          setIsScrolled(shouldBeScrolled);
        }
        
        lastScrollUpdate.current = now;
        scrollTimeoutRef.current = null;
      }, 300);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    };
  }, [isScrolled]);

  if (!isMobile || !mounted) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t w-full",
      isScrolled 
        ? "border-border/40 bg-black/95 backdrop-blur-xl" 
        : "border-border/20 bg-black/90 backdrop-blur-lg"
    )}>
      <div className="flex h-14 items-center justify-around px-1 max-w-[480px] mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
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
          );
        })}
      </div>
    </div>
  );
};
