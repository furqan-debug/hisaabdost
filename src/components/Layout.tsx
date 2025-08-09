import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/lib/auth';
import { OptimizedLoadingScreen } from '@/components/shared/OptimizedLoadingScreen';
import Navbar from './Navbar';
import { BottomNavigation } from './BottomNavigation';
import { LayoutWrapper } from './layout/LayoutWrapper';
import { LayoutContainer } from './layout/LayoutContainer';
import { BannerAd } from './ads/BannerAd';
import { useModalState } from '@/hooks/useModalState';

const Layout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [pageTransition, setPageTransition] = useState(false);
  const { user, loading } = useAuth();
  const { isModalOpen } = useModalState();
  
  // Check if current route is a main tab that shows ads
  const isMainTabRoute = ['/app/dashboard', '/app/expenses', '/app/budget', '/app/analytics', '/app/goals'].includes(location.pathname);
  
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // --- THIS IS THE CORRECTED SCROLL-TO-TOP LOGIC ---
  useEffect(() => {
    // Using a timeout with a very short delay ensures the scroll happens
    // after the new page has had a chance to render.
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100); // A small 100ms delay is imperceptible but very reliable.

    return () => clearTimeout(timer);
  }, [location.pathname]); // This effect runs every time the page route changes.
  // --- END OF CORRECTED LOGIC ---

  console.log('Layout: loading =', loading, 'user =', !!user);

  if (loading) {
    return <OptimizedLoadingScreen message="Loading app..." />;
  }

  if (!user) {
    console.log('Layout: No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('Layout: User authenticated, rendering app');

  return (
    <LayoutWrapper>
      <Navbar />
      {isMainTabRoute && (
        <BannerAd 
          adId="ca-app-pub-8996865130200922/2236789637" 
          visible={!isModalOpen} 
        />
      )}
      <LayoutContainer 
        isMobile={isMobile} 
        pageTransition={pageTransition}
      >
        <Outlet />
      </LayoutContainer>
      {isMobile && <BottomNavigation />}
    </LayoutWrapper>
  );
};

export default Layout;