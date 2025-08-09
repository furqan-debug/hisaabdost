import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  // Ensure the browser doesn't restore previous scroll automatically
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const prev = (window.history as any).scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        try {
          window.history.scrollRestoration = prev ?? 'auto';
        } catch {
          /* noop */
        }
      };
    }
  }, []);

  useEffect(() => {
    // Scroll both window and any main container to top
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      const main = document.querySelector('main');
      if (main) {
        (main as HTMLElement).scrollTop = 0;
      }
    });
  }, [pathname]);

  return null;
}
