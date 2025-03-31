
import React, { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ReceiptText, PieChart, Target, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = memo(({ icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center w-full rounded-md py-1.5 transition-all duration-200",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <div className="relative">
        {icon}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -bottom-1 left-1/2 h-1 w-1 rounded-full bg-primary -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );
});

NavItem.displayName = "NavItem";

export const BottomNavigation = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const currentPath = location.pathname;
  
  const navItems = [
    {
      path: "/dashboard",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
    },
    {
      path: "/expenses",
      label: "Expenses",
      icon: <ReceiptText className="h-5 w-5" />,
    },
    {
      path: "/budget",
      label: "Budget",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      path: "/goals",
      label: "Goals",
      icon: <Target className="h-5 w-5" />,
    },
  ];

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-background/95 backdrop-blur-lg border-t border-border/40 bottom-nav-shadow">
      <div className="flex h-16 items-center justify-around px-1 max-w-[480px] mx-auto">
        <AnimatePresence>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={currentPath.includes(item.path)}
              onClick={() => navigate(item.path)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

BottomNavigation.displayName = "BottomNavigation";
