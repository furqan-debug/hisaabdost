
import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile initially
    setIsMobile(window.innerWidth < 768);

    // Create a listener for window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile };
}

// Define useMobile as a function instead of an alias to ensure it's properly exported
export function useMobile() {
  // Call useIsMobile internally and return the same result
  return useIsMobile();
}
