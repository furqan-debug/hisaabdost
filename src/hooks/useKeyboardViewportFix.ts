import { useEffect } from "react";

interface KeyboardViewportFixOptions {
  sheetRef: React.RefObject<HTMLElement | null>;
  scrollRef?: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
}

// Robust mobile keyboard handling using VisualViewport
// - Adds bottom padding to keep actions visible when keyboard opens
// - Resets scroll and transform when keyboard closes so the sheet returns fully
export function useKeyboardViewportFix({ sheetRef, scrollRef, enabled = true }: KeyboardViewportFixOptions) {
  useEffect(() => {
    if (!enabled) return;

    const vv: VisualViewport | undefined = (window as any).visualViewport;
    let lastHeight = vv?.height ?? window.innerHeight;

    const handleResize = () => {
      const currentHeight = vv?.height ?? window.innerHeight;
      const delta = lastHeight - currentHeight; // positive when keyboard opens
      const absDelta = Math.abs(delta);

      // Use threshold to filter out minor viewport changes
      if (absDelta > 80) {
        if (delta > 0) {
          // Keyboard opened
          const kbHeight = Math.max(0, (window.innerHeight - currentHeight));
          if (scrollRef?.current) {
            (scrollRef.current as HTMLElement).style.paddingBottom = `${kbHeight + 24}px`;
          }
          if (sheetRef?.current) {
            sheetRef.current.classList.add("keyboard-open");
          }
        } else {
          // Keyboard closed
          if (scrollRef?.current) {
            (scrollRef.current as HTMLElement).style.paddingBottom = "";
            // Reset scroll so bottom actions are visible again
            (scrollRef.current as HTMLElement).scrollTop = 0;
          }
          // Ensure the page itself isn't scrolled weirdly
          window.scrollTo(0, 0);
          if (sheetRef?.current) {
            (sheetRef.current as HTMLElement).style.transform = "translateY(0)";
            sheetRef.current.classList.remove("keyboard-open");
          }
        }
        lastHeight = currentHeight;
      } else {
        lastHeight = currentHeight;
      }
    };

    const handleFocusOut = () => {
      // Safety: when any input blurs and keyboard likely hides, reset soon after
      setTimeout(() => {
        if (scrollRef?.current) {
          (scrollRef.current as HTMLElement).style.paddingBottom = "";
          (scrollRef.current as HTMLElement).scrollTop = 0;
        }
        window.scrollTo(0, 0);
        if (sheetRef?.current) {
          (sheetRef.current as HTMLElement).style.transform = "translateY(0)";
          sheetRef.current.classList.remove("keyboard-open");
        }
      }, 100);
    };

    vv?.addEventListener("resize", handleResize);
    vv?.addEventListener("scroll", handleResize);
    window.addEventListener("focusout", handleFocusOut, true);

    return () => {
      vv?.removeEventListener("resize", handleResize);
      vv?.removeEventListener("scroll", handleResize);
      window.removeEventListener("focusout", handleFocusOut, true);
    };
  }, [enabled, sheetRef, scrollRef]);
}
