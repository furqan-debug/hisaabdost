
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BottomNavigation } from './BottomNavigation';

const Layout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);
  
  // Add page transition effect when route changes
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isBudgetRoute = location.pathname.includes('/budget');

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <Navbar />
      <main className={cn(
        "flex-1 transition-all duration-300 pb-20 md:pb-8 overflow-x-hidden",
        isBudgetRoute ? "px-0" : "px-3 md:px-6",
        pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0"
      )}>
        <div className={cn(
          "mx-auto w-full", 
          isMobile ? "max-w-full" : "max-w-5xl",
          pageTransition ? "animate-fade-in" : ""
        )}>
          <Outlet />
        </div>
      </main>
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;
