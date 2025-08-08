
import { useEffect } from "react";

interface KeyboardViewportFixOptions {
  sheetRef: React.RefObject<HTMLElement | null>;
  scrollRef?: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
}

// Robust mobile keyboard handling using VisualViewport
// - Adds bottom padding to keep actions visible when keyboard opens
// - Resets scroll and transform when keyboard closes so the sheet returns fully
// - Enhanced support for tall screens like 1080x2400
export function useKeyboardViewportFix({ sheetRef, scrollRef, enabled = true }: KeyboardViewportFixOptions) {
  useEffect(() => {
    if (!enabled) return;

    const vv: VisualViewport | undefined = (window as any).visualViewport;
    let lastHeight = vv?.height ?? window.innerHeight;
    let isKeyboardOpen = false;

    const handleResize = () => {
      const currentHeight = vv?.height ?? window.innerHeight;
      const windowHeight = window.innerHeight;
      const delta = lastHeight - currentHeight;
      const heightDiff = windowHeight - currentHeight;
      
      // Enhanced detection for tall screens - use more sensitive threshold
      const threshold = window.innerHeight > 800 ? 150 : 80;
      
      if (heightDiff > threshold && !isKeyboardOpen) {
        // Keyboard opened
        isKeyboardOpen = true;
        const kbHeight = Math.max(0, heightDiff);
        
        if (scrollRef?.current) {
          (scrollRef.current as HTMLElement).style.paddingBottom = `${Math.min(kbHeight + 24, 200)}px`;
        }
        
        if (sheetRef?.current) {
          sheetRef.current.classList.add("keyboard-open");
          // For tall screens, add a slight upward translation to ensure input visibility
          if (window.innerHeight > 800) {
            (sheetRef.current as HTMLElement).style.transform = `translateY(-${Math.min(kbHeight * 0.1, 50)}px)`;
          }
        }
        
        document.body.classList.add("keyboard-open");
        
      } else if (heightDiff <= 50 && isKeyboardOpen) {
        // Keyboard closed
        isKeyboardOpen = false;
        
        if (scrollRef?.current) {
          (scrollRef.current as HTMLElement).style.paddingBottom = "";
          // Smooth scroll reset
          (scrollRef.current as HTMLElement).scrollTop = 0;
        }
        
        // Reset page scroll
        window.scrollTo(0, 0);
        
        if (sheetRef?.current) {
          (sheetRef.current as HTMLElement).style.transform = "translateY(0)";
          sheetRef.current.classList.remove("keyboard-open");
        }
        
        document.body.classList.remove("keyboard-open");
      }
      
      lastHeight = currentHeight;
    };

    const handleFocusOut = () => {
      // Safety: when any input blurs and keyboard likely hides, reset after delay
      setTimeout(() => {
        if (!document.activeElement?.tagName.match(/INPUT|TEXTAREA/)) {
          isKeyboardOpen = false;
          
          if (scrollRef?.current) {
            (scrollRef.current as HTMLElement).style.paddingBottom = "";
            (scrollRef.current as HTMLElement).scrollTop = 0;
          }
          
          window.scrollTo(0, 0);
          
          if (sheetRef?.current) {
            (sheetRef.current as HTMLElement).style.transform = "translateY(0)";
            sheetRef.current.classList.remove("keyboard-open");
          }
          
          document.body.classList.remove("keyboard-open");
        }
      }, 150);
    };

    const handleScroll = () => {
      // Prevent unwanted scrolling when keyboard is open
      if (isKeyboardOpen) {
        window.scrollTo(0, 0);
      }
    };

    // Enhanced event listeners for better keyboard detection
    vv?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);
    window.addEventListener("focusout", handleFocusOut, true);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      vv?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focusout", handleFocusOut, true);
      window.removeEventListener("scroll", handleScroll, true);
      
      // Clean up classes on unmount
      document.body.classList.remove("keyboard-open");
    };
  }, [enabled, sheetRef, scrollRef]);
}
