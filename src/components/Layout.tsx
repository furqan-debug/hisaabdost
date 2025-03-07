
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { MonthProvider } from '@/hooks/use-month-context';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <MonthProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full bg-background">
          {!isMobile && <Sidebar />}
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 px-2 pt-2 pb-24 md:px-6 md:pt-6 md:pb-6 overflow-x-hidden animate-fade-in">
              <div className={`mx-auto w-full ${isMobile ? 'max-w-full' : 'max-w-[480px]'}`}>
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
