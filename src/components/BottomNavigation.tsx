
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Receipt, PiggyBank, BarChart2, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl shadow-lg">
      <nav className="flex h-16 items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="w-1/5">
              <Button
                variant="ghost"
                size="icon"
                className={`flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-none transition-all duration-300 ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <item.icon size={22} className={`${isActive ? "text-primary scale-110" : ""} transition-all duration-300`} />
                  {isActive && (
                    <span className="absolute -top-1.5 h-1 w-6 rounded-full bg-primary animate-scale-in" />
                  )}
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? "text-primary" : ""}`}>
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
