
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
  
  return (
    <main className={cn(
      "flex-1 overflow-x-hidden",
      // Safe area aware padding for mobile devices - account for header (3.5rem) + banner ad (5rem)
      "pt-[calc(3.5rem+env(safe-area-inset-top))]",
      // Bottom navigation spacing only
      isMobile ? "pb-20" : "pb-8",
      isBudgetRoute ? "px-0" : "px-2 md:px-6",
      pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0",
      "transition-all duration-300"
    )}>
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
