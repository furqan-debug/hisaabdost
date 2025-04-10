
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);
  
  // Add page transition effect when route changes
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <Navbar />
        <main className={cn(
          "flex-1 px-2 pt-3 pb-20 md:px-8 md:pt-6 md:pb-8 overflow-x-hidden transition-all duration-300",
          pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0"
        )}>
          <div className={cn(
            "mx-auto w-full overflow-guard prevent-overflow", 
            isMobile ? "max-w-full px-0" : "max-w-5xl",
            pageTransition ? "animate-fade-in" : ""
          )}>
            {children}
          </div>
        </main>
        {isMobile && <BottomNavigation />}
      </div>
    </div>
  );
};

export default Layout;
