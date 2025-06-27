
import { useState, useRef, useEffect, useCallback } from 'react';

interface UseProgressAnimationProps {
  isScanning: boolean;
  backendProgress: number;
}

export function useProgressAnimation({ isScanning, backendProgress }: UseProgressAnimationProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);

  // Optimized progress calculation with memoization
  const calculateTarget = useCallback((progress: number) => {
    if (progress >= 100) return 100;
    if (progress >= 75) return Math.min(95, progress);
    if (progress >= 50) return Math.min(75, progress);
    if (progress >= 25) return Math.min(50, progress);
    return Math.min(25, Math.max(progress * 1.1, 5));
  }, []);

  useEffect(() => {
    if (!isScanning) {
      setDisplayedProgress(0);
      currentProgressRef.current = 0;
      targetProgressRef.current = 0;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      return;
    }

    const newTarget = calculateTarget(backendProgress);
    if (newTarget > targetProgressRef.current) {
      targetProgressRef.current = newTarget;
    }

    // Throttled animation with better performance
    const animate = (timestamp: number) => {
      // Throttle to 60fps max
      if (timestamp - lastUpdateTime.current < 16) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = timestamp - lastUpdateTime.current;
      lastUpdateTime.current = timestamp;

      const distanceToTarget = targetProgressRef.current - currentProgressRef.current;
      
      if (distanceToTarget > 0) {
        const frameSpeed = Math.min(10, Math.max(2, distanceToTarget / 10)) * (deltaTime / 1000);
        const movement = Math.min(frameSpeed, distanceToTarget);
        
        currentProgressRef.current += movement;
        setDisplayedProgress(Math.round(currentProgressRef.current * 100) / 100);
      }

      if (currentProgressRef.current < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [isScanning, backendProgress, calculateTarget]);

  return displayedProgress;
}
