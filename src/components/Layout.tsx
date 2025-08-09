import React, { useLayoutEffect, useState, useRef } from 'react';
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
  
  const layoutContainerRef = useRef<HTMLDivElement>(null);
  
  const isMainTabRoute = ['/app/dashboard', '/app/expenses', '/app/budget', '/app/analytics', '/app/goals'].includes(location.pathname);
  
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // THIS IS THE FINAL, CORRECTED SCROLL LOGIC
  useLayoutEffect(() => {
    if (layoutContainerRef.current) {
      layoutContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  if (loading) {
    return <OptimizedLoadingScreen message="Loading app..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
        ref={layoutContainerRef}
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