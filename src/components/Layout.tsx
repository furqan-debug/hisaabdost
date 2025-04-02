
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <MemoizedNavbar />
        <main className="flex-1 px-3 pt-3 pb-20 md:px-8 md:pt-6 md:pb-8 overflow-auto">
          <div 
            className={isMobile ? "mx-auto w-full max-w-full px-0.5 pb-20" : "mx-auto w-full max-w-5xl"}
          >
            {children}
          </div>
          {/* Spacer to ensure content doesn't get hidden behind the navigation bar */}
          {isMobile && <div className="h-16" />}
        </main>
        {isMobile && <MemoizedBottomNavigation />}
      </div>
    </div>
  );
};

export default memo(Layout);
