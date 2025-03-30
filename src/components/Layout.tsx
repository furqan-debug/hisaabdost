
import React from 'react';
import Navbar from './Navbar';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 px-3 pt-3 pb-20 md:px-8 md:pt-6 md:pb-8 overflow-hidden">
          <div className={isMobile ? "mx-auto w-full max-w-full px-0.5 disable-animations" : "mx-auto w-full max-w-5xl"}>
            {children}
          </div>
        </main>
        {isMobile && <BottomNavigation />}
      </div>
    </div>
  );
};

export default Layout;
