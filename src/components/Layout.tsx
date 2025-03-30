
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
  const [isContentReady, setIsContentReady] = useState(false);
  
  // Add page transition effect when route changes with reduced animation
  useEffect(() => {
    // Immediately make content ready to avoid blank screens
    setIsContentReady(true);
    
    // Short transition effect
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Ensure content is visible even before transitions complete
  useEffect(() => {
    if (!isContentReady) {
      setIsContentReady(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className={cn(
          "flex-1 px-3 pt-3 pb-20 md:px-8 md:pt-6 md:pb-8 overflow-hidden transition-opacity duration-200",
          pageTransition ? "opacity-95" : "opacity-100"
        )}>
          <div className={cn(
            "mx-auto w-full", 
            isMobile ? "max-w-full px-0.5" : "max-w-5xl",
            isContentReady ? "opacity-100" : "opacity-0",
            "transition-opacity duration-200"
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
