
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

  // Calculate proper top spacing accounting for safe areas and navbar
  const getMobileTopSpacing = () => {
    if (isMobile) {
      // Just navbar + safe area + extra spacing  
      return "calc(3.5rem + max(env(safe-area-inset-top, 44px), 44px) + 1rem)";
    }
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
