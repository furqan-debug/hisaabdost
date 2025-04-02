
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
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full bg-background">
          {!isMobile && <Sidebar />}
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className={cn(
              "flex-1 px-2 pt-2 pb-24 md:px-6 md:pt-6 md:pb-6 overflow-x-hidden transition-opacity duration-300",
              pageTransition ? "opacity-95" : "opacity-100"
            )}>
              <div className={cn(
                "mx-auto w-full", 
                isMobile ? "max-w-full" : "max-w-[480px]",
                pageTransition ? "animate-fade-in" : ""
              )}>
                {children}
              </div>
            </main>
            {isMobile && <BottomNavigation />}
          </div>
        </div>
      </SidebarProvider>
    </MonthProvider>
  );
};

export default Layout;
