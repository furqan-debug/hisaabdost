
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
      "flex-1 transition-all duration-300 pb-16 md:pb-8",
      "max-w-[100vw] overflow-x-hidden",
      isBudgetRoute ? "px-0" : "px-2 md:px-6",
      pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0"
    )}>
      <div className={cn(
        "mx-auto w-full overflow-x-hidden",
        isMobile ? "max-w-full" : "max-w-5xl",
        pageTransition ? "animate-fade-in" : "",
        "space-y-4 md:space-y-6"
      )}>
        {children}
      </div>
    </main>
  );
}
