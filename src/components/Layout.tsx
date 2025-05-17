
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/lib/auth';
import Navbar from './Navbar';
import { BottomNavigation } from './BottomNavigation';
import { LayoutWrapper } from './layout/LayoutWrapper';
import { LayoutContainer } from './layout/LayoutContainer';

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
    <LayoutWrapper>
      <Navbar />
      <LayoutContainer 
        isMobile={isMobile} 
        pageTransition={pageTransition}
      >
        <div className="py-4">
          <Outlet />
        </div>
      </LayoutContainer>
      {isMobile && <BottomNavigation />}
    </LayoutWrapper>
  );
};

export default Layout;
