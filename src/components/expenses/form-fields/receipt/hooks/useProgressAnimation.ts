
import { useState, useRef, useEffect } from 'react';

interface UseProgressAnimationProps {
  isScanning: boolean;
  backendProgress: number;
}

export function useProgressAnimation({ isScanning, backendProgress }: UseProgressAnimationProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);
  
  // Updated progress steps for smoother animation
  const progressStepsRef = useRef({
    initial: 0,     // Start at 0% instead of 5%
    scanning: 25,   // First milestone (was 30%)
    processing: 50, // Second milestone (was 60%)
    analyzing: 75,  // Third milestone (was 80%)
    complete: 100   // Final value
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
        // If backend is complete, gradually move to 100%
        if (backendProgress >= 100) {
          // Faster progression to 100% when backend is done
          return Math.min(prevProgress + (deltaTime * 0.1), 100);
        }
        
        // Determine target based on backend progress
        // This prevents the progress from getting too far ahead of actual backend progress
        let targetProgress = backendProgress;
        if (backendProgress < 20) {
          targetProgress = Math.min(backendProgress * 1.2, 25); // Allow slight advancement
        } else if (backendProgress < 50) {
          targetProgress = Math.min(backendProgress * 1.1, 60);
        } else if (backendProgress < 75) {
          targetProgress = Math.min(backendProgress * 1.05, 85);
        } else {
          targetProgress = Math.min(backendProgress, 95); // Don't go to 100% until backend is done
        }
        
        let newProgress = prevProgress;
        let speedFactor = 0;
        
        // Use different speed factors based on current progress stage
        // and make sure we're not going too far ahead of backend progress
        if (prevProgress < progressStepsRef.current.scanning) {
          // Medium initial progress to 25%
          speedFactor = 0.04; // 4% per second
        } else if (prevProgress < progressStepsRef.current.processing) {
          // Medium speed to 50%
          speedFactor = 0.035; // 3.5% per second
        } else if (prevProgress < progressStepsRef.current.analyzing) {
          // Slightly slower progress to 75%
          speedFactor = 0.03; // 3% per second
        } else {
          // Even slower progress after 75% until completion
          speedFactor = 0.02; // 2% per second
        }
        
        // Calculate new progress based on time and speed factor
        newProgress += (deltaTime * speedFactor);
        
        // Ensure we don't exceed target progress
        return Math.min(newProgress, targetProgress);
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

  // When backend reports 100%, smoothly transition to 100% instead of jumping
  useEffect(() => {
    if (backendProgress >= 100 && isScanning) {
      // Don't immediately set to 100%, let the animation finish naturally
      // but increase the speed of the animation
      lastUpdateTime.current = performance.now(); // Reset time for smooth animation
    }
  }, [backendProgress, isScanning]);

  return displayedProgress;
}
