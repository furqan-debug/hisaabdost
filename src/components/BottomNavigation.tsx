
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Receipt, PiggyBank, BarChart2, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: PiggyBank, label: "Budget", path: "/budget" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: Target, label: "Goals", path: "/goals" },
];

export function BottomNavigation() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isMobile || !mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-xl shadow-lg">
      <div className="flex h-16 items-center justify-around px-1 max-w-[480px] mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path} className="w-1/5">
              <div
                className={`flex flex-col items-center justify-center h-14 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <item.icon 
                    size={24} 
                    className={`transition-all duration-300 ${
                      isActive ? "text-primary scale-110" : "text-muted-foreground"
                    }`} 
                  />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span 
                  className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                    isActive ? "text-primary" : ""
                  }`}
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
