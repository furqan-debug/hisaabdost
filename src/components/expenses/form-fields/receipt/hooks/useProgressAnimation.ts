
import { useState, useRef, useEffect } from 'react';

interface UseProgressAnimationProps {
  isScanning: boolean;
  backendProgress: number;
}

export function useProgressAnimation({ isScanning, backendProgress }: UseProgressAnimationProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);
  
  // Use refs to track animation state
  const currentProgressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const previousDirectionRef = useRef<'forward' | 'none'>('none');

  // Define progress milestones
  const milestones = useRef({
    initial: 0,     // Starting point
    stage1: 25,     // First quarter
    stage2: 50,     // Halfway
    stage3: 75,     // Third quarter
    complete: 100   // Final point
  });

  // Calculate target based on backend progress
  const calculateTarget = (backendProgress: number) => {
    // Always move forward, never backward
    if (backendProgress >= 100) {
      return 100;
    } else if (backendProgress >= 75) {
      return Math.min(95, backendProgress);
    } else if (backendProgress >= 50) {
      return Math.min(75, backendProgress);
    } else if (backendProgress >= 25) {
      return Math.min(50, backendProgress);
    } else {
      return Math.min(25, Math.max(backendProgress * 1.1, 5)); // Ensure at least 5% at start
    }
  };

  useEffect(() => {
    if (!isScanning) {
      // Reset progress when not scanning
      setDisplayedProgress(0);
      currentProgressRef.current = 0;
      targetProgressRef.current = 0;
      previousDirectionRef.current = 'none';
      
      // Clean up any animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Set initial progress and target
    if (currentProgressRef.current === 0) {
      // Starting fresh - begin at 0% and move to at least 5%
      setDisplayedProgress(0);
      currentProgressRef.current = 0;
      targetProgressRef.current = calculateTarget(backendProgress);
      previousDirectionRef.current = 'forward';
    } else {
      // Update the target based on new backend progress
      const newTarget = calculateTarget(backendProgress);
      // IMPORTANT: Only update target if it would move forward
      if (newTarget > targetProgressRef.current) {
        targetProgressRef.current = newTarget;
      }
    }

    lastUpdateTime.current = performance.now();

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastUpdateTime.current;
      lastUpdateTime.current = timestamp;

      // Calculate the distance to target
      const distanceToTarget = targetProgressRef.current - currentProgressRef.current;
      
      // Only move forward, never backward
      if (distanceToTarget > 0) {
        // Base speed is 2-10% per second depending on the distance
        const baseSpeed = Math.min(10, Math.max(2, distanceToTarget / 10));
        
        // Calculate actual speed for this frame
        const frameSpeed = baseSpeed * (deltaTime / 1000);
        
        // Apply easing for more natural movement
        // Slower at beginning and end, faster in the middle
        const position = currentProgressRef.current / 100;
        const easing = 0.5 - 0.5 * Math.cos(position * Math.PI);
        
        // Move progress forward, never more than the distance to target
        const movement = Math.min(frameSpeed * (1 + easing), distanceToTarget);
        
        // Update the current progress
        currentProgressRef.current += movement;
        
        // Update the state (rounded to 2 decimal places for efficiency)
        const roundedProgress = Math.round(currentProgressRef.current * 100) / 100;
        setDisplayedProgress(roundedProgress);
        
        previousDirectionRef.current = 'forward';
      }

      // Continue animation until we reach 100% exactly
      if (currentProgressRef.current < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Start the animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, backendProgress]);

  return displayedProgress;
}
