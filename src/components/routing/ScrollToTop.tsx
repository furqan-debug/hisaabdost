
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Disable browser's default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => {
      // Force immediate scroll to top with multiple fallbacks
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // For mobile apps and webkit browsers
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }
      
      // Reset any overflow containers
      const containers = document.querySelectorAll('[data-scroll-container], main, .overflow-auto, .overflow-y-auto');
      containers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.scrollTop = 0;
        }
      });

      // Additional mobile-specific resets
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        // Force repaint on mobile
        document.body.style.transform = 'translateZ(0)';
        requestAnimationFrame(() => {
          document.body.style.transform = '';
        });
      }
    };

    // Execute immediately
    scrollToTop();
    
    // Also execute after a short delay to catch any async renders
    const timeoutId = setTimeout(scrollToTop, 100);
    
    // Execute in next animation frame for smooth handling
    const rafId = requestAnimationFrame(() => {
      scrollToTop();
    });

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
}
