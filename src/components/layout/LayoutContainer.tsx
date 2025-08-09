import React from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface LayoutContainerProps {
  children: React.ReactNode;
  isMobile: boolean;
  pageTransition: boolean;
}

// FIX: The component is now wrapped in React.forwardRef to accept a 'ref'
export const LayoutContainer = React.forwardRef<HTMLDivElement, LayoutContainerProps>(
  ({ children, isMobile, pageTransition }, ref) => {
    const location = useLocation();
    const isBudgetRoute = location.pathname.includes('/budget');
    
    // Check if current route is a main tab that shows ads
    const isMainTabRoute = ['/app/dashboard', '/app/expenses', '/app/budget', '/app/analytics', '/app/goals'].includes(location.pathname);

    return (
      <main 
        ref={ref} // The ref is attached to the main scrollable element
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden", // Added overflow-y-auto to ensure it's the scroll container
          // Safe area aware padding for mobile devices  
          // Header height (3.5rem) + banner ad height (3rem) + safe area (mobile only)
          isMobile && isMainTabRoute ? "pt-[calc(6.5rem+env(safe-area-inset-top)+1rem)]" : "pt-[calc(6.5rem+env(safe-area-inset-top))]",
          // Proper spacing for mobile with navigation and safe areas
          isMobile && isMainTabRoute ? "pb-20" : isMobile ? "pb-20" : "pb-8",
          isBudgetRoute ? "px-0" : "px-2 md:px-6",
          pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0",
          "transition-all duration-300"
        )} 
        style={{ 
          paddingTop: isMobile && isMainTabRoute ? `calc(6.5rem + env(safe-area-inset-top) + 1rem)` : `calc(6.5rem + env(safe-area-inset-top))`
        }}>
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
);
