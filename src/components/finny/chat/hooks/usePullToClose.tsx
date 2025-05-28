
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UsePullToCloseProps {
  isOpen: boolean;
  isAtTop: boolean;
  headerRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

export const usePullToClose = ({ isOpen, isAtTop, headerRef, onClose }: UsePullToCloseProps) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    const header = headerRef.current;
    
    if (!isMobile || !header || !isOpen) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start gesture if we're at the top of the chat
      if (!isAtTop) return;
      
      startY = e.touches[0].clientY;
      currentY = startY;
      isDragging = false;
      startTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only process if we started at the top
      if (!isAtTop) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const deltaTime = Date.now() - startTime;
      
      // More restrictive conditions for pull-to-close:
      // 1. Must drag down at least 100px (increased from 50px)
      // 2. Must be a reasonably fast gesture (within 800ms)
      // 3. Must maintain downward direction
      if (deltaY > 100 && deltaTime < 800 && deltaY > 0) {
        isDragging = true;
      }
    };

    const handleTouchEnd = () => {
      // Only close if all conditions are met and we're still at the top
      if (isDragging && isAtTop) {
        onClose();
      }
      
      // Reset state
      isDragging = false;
      startY = 0;
      currentY = 0;
    };

    // Add touch listeners only to the header
    header.addEventListener('touchstart', handleTouchStart, { passive: true });
    header.addEventListener('touchmove', handleTouchMove, { passive: true });
    header.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      header.removeEventListener('touchstart', handleTouchStart);
      header.removeEventListener('touchmove', handleTouchMove);
      header.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isOpen, onClose, isAtTop, headerRef]);
};
