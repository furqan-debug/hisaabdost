
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
  
  // Check if current route is a main tab that shows ads
  const isMainTabRoute = ['/app/dashboard', '/app/expenses', '/app/budget', '/app/analytics', '/app/goals'].includes(location.pathname);

  return (
    <main className={cn(
      "flex-1 transition-all duration-300 overflow-x-hidden max-w-[100vw]",
      // Proper spacing for mobile with navigation and safe areas
      isMobile && isMainTabRoute ? "pt-4 pb-20" : isMobile ? "pb-20 pt-2" : "pb-8 pt-4",
      // Safe area handling for different devices
      isMobile ? "safe-area-container" : "",
      isBudgetRoute ? "px-0" : "px-2 md:px-6",
      pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0"
    )}>
      <style>{`
        .safe-area-container {
          /* Handle safe areas for different devices */
          padding-top: max(env(safe-area-inset-top, 0px), 1rem);
          padding-bottom: max(env(safe-area-inset-bottom, 0px), 5rem);
          padding-left: env(safe-area-inset-left, 0px);
          padding-right: env(safe-area-inset-right, 0px);
        }
      `}</style>
      
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
