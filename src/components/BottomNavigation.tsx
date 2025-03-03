
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Receipt, PiggyBank, BarChart2, Target, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/90 backdrop-blur-xl shadow-lg">
      <div className="flex h-20 items-center justify-around px-1 max-w-[480px] mx-auto relative">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          // Middle item - special Add button
          if (index === Math.floor(navItems.length / 2)) {
            return (
              <div key="add-button" className="relative w-1/5 -top-5">
                <Link to="/expenses" className="block">
                  <Button 
                    variant="purple" 
                    size="icon-lg" 
                    className="shadow-xl mx-auto flex items-center justify-center"
                  >
                    <Plus className="h-6 w-6 text-white" />
                    <span className="sr-only">Add new expense</span>
                  </Button>
                </Link>
              </div>
            );
          }
          
          // Regular tab items
          return (
            <Link key={item.path} to={item.path} className="w-1/5">
              <div
                className={`flex flex-col items-center justify-center h-16 ${
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
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <span 
                  className={`text-xs font-medium mt-1.5 transition-colors duration-300 ${
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
