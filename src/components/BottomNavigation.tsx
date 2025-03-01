
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl shadow-lg animate-fade-in">
      <nav className="flex h-18 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className="flex-1">
              <Button
                variant={isActive ? "default" : "ghost"}
                size="icon"
                className={`flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-none transition-all duration-300 ${
                  isActive 
                    ? "bg-accent/30 text-primary" 
                    : "hover:bg-accent/10"
                }`}
              >
                <item.icon size={24} className={`${isActive ? "text-primary scale-110" : ""} transition-all`} />
                <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-1 w-12 h-1 rounded-full bg-primary animate-scale-in" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
