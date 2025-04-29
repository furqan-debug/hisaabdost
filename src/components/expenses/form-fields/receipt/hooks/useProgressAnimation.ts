
import { useState, useRef, useEffect } from 'react';

interface UseProgressAnimationProps {
  isScanning: boolean;
  backendProgress: number;
}

export function useProgressAnimation({ isScanning, backendProgress }: UseProgressAnimationProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  
  // Progress stages for a smoother animation flow
  const progressStepsRef = useRef({
    initial: 0,     // Start point
    scanning: 25,   // First milestone
    processing: 50, // Second milestone
    analyzing: 75,  // Third milestone
    complete: 100   // Final value
  });

  // Initialize animation when scanning starts or stops
  useEffect(() => {
    if (!isScanning) {
      setDisplayedProgress(0);
      targetProgressRef.current = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Reset progress when scanning starts
    setDisplayedProgress(progressStepsRef.current.initial);
    targetProgressRef.current = Math.min(25, backendProgress * 1.2); // Initial target
    lastUpdateTime.current = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastUpdateTime.current;
      lastUpdateTime.current = currentTime;

      // Calculate the appropriate target based on backend progress
      if (backendProgress >= 100) {
        targetProgressRef.current = 100;
      } else if (backendProgress >= 75) {
        targetProgressRef.current = Math.min(backendProgress, 95);
      } else if (backendProgress >= 50) {
        targetProgressRef.current = Math.min(backendProgress * 1.05, 75);
      } else if (backendProgress >= 25) {
        targetProgressRef.current = Math.min(backendProgress * 1.1, 50);
      } else {
        targetProgressRef.current = Math.min(backendProgress * 1.2, 25);
      }

      setDisplayedProgress(prevProgress => {
        // Calculate distance to target
        const distanceToTarget = targetProgressRef.current - prevProgress;
        
        // Base speed adjusted by distance (higher speed when further from target)
        let baseSpeed = 0.02; // 2% per second at minimum
        
        // Adaptive speed based on distance to target
        // This creates a natural acceleration/deceleration effect
        if (Math.abs(distanceToTarget) > 20) {
          baseSpeed = 0.05; // 5% per second when far from target
        } else if (Math.abs(distanceToTarget) > 10) {
          baseSpeed = 0.035; // 3.5% per second when moderately far from target
        } else if (Math.abs(distanceToTarget) > 5) {
          baseSpeed = 0.025; // 2.5% per second when somewhat close to target
        }
        
        // Ensure we have a minimum speed even when very close to target
        const minSpeed = 0.005; // 0.5% minimum movement per second
        
        // Direction-aware speed calculation
        let speedThisFrame = Math.max(
          Math.abs(distanceToTarget) * baseSpeed * (deltaTime / 1000),
          minSpeed * (deltaTime / 1000)
        );
        
        // Cap maximum speed to avoid large jumps
        speedThisFrame = Math.min(speedThisFrame, 1.5 * (deltaTime / 1000));
        
        // Apply direction
        if (distanceToTarget < 0) speedThisFrame *= -1;
        
        // Calculate new progress with easing for smoother motion
        const easingFactor = 0.92; // Higher values make movement smoother but slower
        let newProgress = prevProgress + speedThisFrame * (1 - easingFactor) + (distanceToTarget * (deltaTime / 1000) * easingFactor);

        // Handle special case of approaching 100% (completion)
        if (backendProgress >= 100 && newProgress > 99.5) {
          return 100; // Jump to exactly 100% to ensure we reach completion
        }
        
        // Ensure we don't exceed boundaries
        return Math.max(0, Math.min(newProgress, 100));
      });

      // Continue animation unless we've reached exactly 100%
      if (displayedProgress !== 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, backendProgress]);

  // Ensure we properly clean up the animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return displayedProgress;
}
