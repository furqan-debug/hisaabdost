
import React from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface LayoutContainerProps {
  children: React.ReactNode;
  isMobile: boolean;
  pageTransition: boolean;
}

export function LayoutContainer({ children, isMobile, pageTransition }: LayoutContainerProps) {
  const location = useLocation();
  const isBudgetRoute = location.pathname.includes('/budget');

  // Calculate proper top spacing accounting for navbar height only
  // Navbar already handles safe area internally, so we don't need to add it again
  const getMobileTopSpacing = () => {
    if (isMobile) {
      // Navbar height: h-12 (48px) + mt-[10px] mb-[10px] (20px) + safe area handled by navbar
      return "68px";
    }
    // Desktop: just navbar base height + any safe area
    return "calc(3.5rem + env(safe-area-inset-top, 0px))";
  };

  return (
    <main 
      className={cn(
        "flex-1 overflow-x-hidden mobile-safe-viewport",
        isMobile ? "pb-20" : "pb-8",
        isBudgetRoute ? "px-0" : "px-2 md:px-6",
        pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0",
        "transition-all duration-300"
      )}
      style={{ 
        paddingTop: getMobileTopSpacing()
      }}
    >
      <div className={cn(
        "mx-auto w-full overflow-x-hidden",
        isMobile ? "max-w-full" : "max-w-5xl",
        pageTransition ? "animate-fade-in" : ""
      )}>
        {children}
      </div>
    </main>
  );
}
