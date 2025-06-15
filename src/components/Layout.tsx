
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/lib/auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Navbar } from './Navbar';
import { BottomNavigation } from './BottomNavigation';
import Sidebar from './Sidebar';

const Layout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);
  const { user, loading } = useAuth();
  
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // If auth is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <Sidebar />}
        <SidebarInset className="flex-1">
          <Navbar />
          <main className={`flex-1 transition-all duration-300 ${pageTransition ? 'opacity-50' : 'opacity-100'}`}>
            <Outlet />
          </main>
        </SidebarInset>
      </div>
      {isMobile && <BottomNavigation />}
    </SidebarProvider>
  );
};

export default Layout;
