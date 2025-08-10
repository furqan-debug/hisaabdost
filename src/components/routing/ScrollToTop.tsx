
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Disable browser's default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force scroll to top on route change
    const scrollToTop = () => {
      // Multiple methods to ensure compatibility across all platforms
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // For mobile apps and webkit browsers
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }
      
      // Additional reset for any potential overflow containers
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }
    };

    // Use setTimeout to ensure DOM is ready and all animations are complete
    const timeoutId = setTimeout(scrollToTop, 0);
    
    // Also try immediately for faster response
    scrollToTop();

    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search]);

  return null;
}
