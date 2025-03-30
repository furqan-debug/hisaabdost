
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
  const [isContentReady, setIsContentReady] = useState(true);
  
  // Simplified - removed page transition effect that may cause continuous refreshes
  useEffect(() => {
    // Ensure content is visible immediately
    setIsContentReady(true);
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 px-3 pt-3 pb-20 md:px-8 md:pt-6 md:pb-8 overflow-hidden">
          <div className={cn(
            "mx-auto w-full", 
            isMobile ? "max-w-full px-0.5" : "max-w-5xl",
            isContentReady ? "opacity-100" : "opacity-0",
            "transition-opacity duration-100"
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
