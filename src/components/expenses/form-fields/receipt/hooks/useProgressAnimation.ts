
import { useState, useRef, useEffect } from 'react';

interface UseProgressAnimationProps {
  isScanning: boolean;
  backendProgress: number;
}

export function useProgressAnimation({ isScanning, backendProgress }: UseProgressAnimationProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);

  useEffect(() => {
    if (!isScanning) {
      setDisplayedProgress(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    setDisplayedProgress(0);
    lastUpdateTime.current = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastUpdateTime.current;
      lastUpdateTime.current = currentTime;

      setDisplayedProgress(prevProgress => {
        if (backendProgress >= 100) {
          return 100;
        }

        let newProgress = prevProgress;
        
        if (prevProgress < 30) {
          newProgress += (deltaTime * 0.05); // 5% per second
        } else if (prevProgress < 60) {
          newProgress += (deltaTime * 0.03); // 3% per second
        } else if (prevProgress < 80) {
          newProgress += (deltaTime * 0.015); // 1.5% per second
        }
        
        return Math.min(newProgress, backendProgress >= 100 ? 100 : 80);
      });

      if (displayedProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, backendProgress, displayedProgress]);

  return displayedProgress;
}
