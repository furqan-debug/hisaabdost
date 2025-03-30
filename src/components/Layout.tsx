
import React, { useEffect, useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { MonthProvider } from '@/hooks/use-month-context';
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
    <MonthProvider>
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <Navbar />
          <main className={cn(
            "flex-1 px-3 pt-3 pb-20 md:px-8 md:pt-6 md:pb-8 overflow-x-hidden transition-all duration-300",
            pageTransition ? "opacity-95 translate-y-1" : "opacity-100 translate-y-0"
          )}>
            <div className={cn(
              "mx-auto w-full overflow-guard", 
              isMobile ? "max-w-full px-0.5" : "max-w-5xl",
              pageTransition ? "animate-fade-in" : ""
            )}>
              {children}
            </div>
          </main>
          {isMobile && <BottomNavigation />}
        </div>
      </div>
    </MonthProvider>
  );
};

export default Layout;
