
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        {!isMobile && <Sidebar />}
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 px-2 md:px-6 pt-2 md:pt-6 overflow-auto animate-fade-in pb-24 md:pb-6">
            {children}
          </main>
          {isMobile && <BottomNavigation />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
