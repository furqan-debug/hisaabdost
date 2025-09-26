
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
  const getMobileTopSpacing = () => {
    if (isMobile) {
      // Navbar height: h-12 (48px) + mt-[10px] mb-[10px] (20px) + py-[2px] (4px) = 72px (4.5rem)
      // Safe area is already handled by the navbar itself
      return "4.5rem";
    }
    return "4.5rem";
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
