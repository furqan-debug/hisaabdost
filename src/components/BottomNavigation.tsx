
import { useLocation, Link } from "react-router-dom";
import { Home, Receipt, Wallet, BarChart2, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      "fixed bottom-0 left-0 right-0 z-50 border-t transition-all duration-300 w-full",
      isScrolled 
        ? "border-border/40 bg-background/95 backdrop-blur-xl shadow-lg" 
        : "border-border/20 bg-background/90 backdrop-blur-lg"
    )}>
      <div className="flex h-16 items-center justify-around px-1 max-w-[480px] mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                           (item.path === "/" && location.pathname === "/dashboard");
          
          return (
            <Link key={item.path} to={item.path} className="w-1/5">
              <div
                className={cn(
                  "menu-item flex flex-col items-center justify-center h-14 transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground/60"
                )}
              >
                <div className="relative">
                  <item.icon 
                    size={19} 
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-primary scale-110 menu-icon-active" : "text-muted-foreground/70"
                    )} 
                  />
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30
                      }}
                      className="menu-indicator absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-primary rounded-full" 
                    />
                  )}
                </div>
                <span 
                  className={cn(
                    "text-[11px] font-medium mt-1.5 transition-colors duration-300",
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
