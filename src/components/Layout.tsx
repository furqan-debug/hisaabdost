
import React, { memo } from 'react';
import Navbar from './Navbar';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

// Memo the NavBar and BottomNavigation to prevent unnecessary re-renders
const MemoizedNavbar = memo(Navbar);
const MemoizedBottomNavigation = memo(BottomNavigation);

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <MemoizedNavbar />
        <main className={`flex-1 overflow-y-auto px-3 pt-3 ${isMobile ? 'pb-24' : 'pb-8'} md:px-8 md:pt-6`}>
          <div 
            className={isMobile ? "mx-auto w-full max-w-full px-0.5" : "mx-auto w-full max-w-5xl"}
          >
            {children}
          </div>
        </main>
        <MemoizedBottomNavigation />
      </div>
    </div>
  );
};

export default memo(Layout);
