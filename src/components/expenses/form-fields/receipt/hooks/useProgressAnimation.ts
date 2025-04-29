
import { useState, useRef, useEffect } from 'react';

interface UseProgressAnimationProps {
  isScanning: boolean;
  backendProgress: number;
}

export function useProgressAnimation({ isScanning, backendProgress }: UseProgressAnimationProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);
  const progressStepsRef = useRef({
    initial: 5,    // Start at 5%
    scanning: 30,  // Jump to 30% quickly
    processing: 60, // Progress to 60% more slowly
    analyzing: 80,  // Progress to 80% even more slowly
    complete: 100  // Final value
  });

  useEffect(() => {
    if (!isScanning) {
      setDisplayedProgress(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Reset progress when scanning starts
    setDisplayedProgress(progressStepsRef.current.initial);
    lastUpdateTime.current = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastUpdateTime.current;
      lastUpdateTime.current = currentTime;

      setDisplayedProgress(prevProgress => {
        // If backend is complete, go to 100%
        if (backendProgress >= 100) {
          return 100;
        }
        
        let newProgress = prevProgress;
        let speedFactor = 0;
        
        // Use different speed factors based on current progress stage
        if (prevProgress < progressStepsRef.current.scanning) {
          // Fast initial progress to 30%
          speedFactor = 0.06; // 6% per second
        } else if (prevProgress < progressStepsRef.current.processing) {
          // Medium speed to 60%
          speedFactor = 0.04; // 4% per second
        } else if (prevProgress < progressStepsRef.current.analyzing) {
          // Slower progress to 80%
          speedFactor = 0.02; // 2% per second
        } else {
          // Very slow progress after 80% until completion
          speedFactor = 0.008; // 0.8% per second
        }
        
        // Calculate new progress based on time and speed factor
        newProgress += (deltaTime * speedFactor);
        
        // Ensure we don't exceed backend progress or target limits
        const maxProgress = backendProgress >= 100 ? 100 : progressStepsRef.current.analyzing;
        return Math.min(newProgress, maxProgress);
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
  }, [isScanning, backendProgress]);

  // When backend reports 100%, immediately set displayed to 100%
  useEffect(() => {
    if (backendProgress >= 100 && isScanning) {
      setDisplayedProgress(100);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [backendProgress, isScanning]);

  return displayedProgress;
}
