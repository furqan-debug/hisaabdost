
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
  
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className={cn(
        "flex-1 flex flex-col px-3 pt-3 pb-20 md:px-6 md:pt-6 md:pb-8 transition-all duration-300 min-h-[calc(100vh-60px)]",
        pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0"
      )}>
        <div className={cn(
          "mx-auto w-full h-full flex flex-col flex-1 min-h-[500px]", 
          isMobile ? "max-w-full px-1" : "max-w-5xl"
        )}>
          <Outlet />
        </div>
      </main>
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;
