import React, { useEffect, useState, useRef } from 'react'; // 1. useRef is added
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
  
  // 2. A reference is created to hold the scrollable container element
  const layoutContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if current route is a main tab that shows ads
  const isMainTabRoute = ['/app/dashboard', '/app/expenses', '/app/budget', '/app/analytics', '/app/goals'].includes(location.pathname);
  
  useEffect(() => {
    setPageTransition(true);
    const timer = setTimeout(() => setPageTransition(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // 3. The old, non-working scroll effect has been replaced with this new, reliable one.
  useEffect(() => {
    // This now targets the specific container and scrolls it to the top on every navigation.
    if (layoutContainerRef.current) {
      layoutContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

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
        // 4. The reference is attached to the LayoutContainer component
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
