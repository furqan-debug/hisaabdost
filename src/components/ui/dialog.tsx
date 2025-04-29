import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

// Enhanced portal with unmount tracking
const DialogPortal = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Portal>, 
  DialogPrimitive.DialogPortalProps & { onCleanup?: () => void }
>(({ onCleanup, children, ...props }, forwardedRef) => {
  // Track portal mounted state
  const portalRef = React.useRef<HTMLDivElement | null>(null);
  
  // Handle portal unmount
  React.useEffect(() => {
    return () => {
      if (onCleanup) {
        console.log("Dialog portal unmounted, running cleanup");
        onCleanup();
      }
    };
  }, [onCleanup]);
  
  return (
    <DialogPrimitive.Portal {...props}>
      <div ref={(node) => {
        // Store ref locally
        portalRef.current = node;
        
        // Forward ref if needed - Fix: Type checking for forwardedRef
        if (typeof forwardedRef === 'function') {
          // Use type assertion to handle the never type issue
          forwardedRef(node as any);
        } else if (forwardedRef) {
          // Use type assertion to handle the never type issue
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}>
        {children}
      </div>
    </DialogPrimitive.Portal>
  );
});

DialogPortal.displayName = "DialogPortal";

// Enhanced overlay with animation and blur
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  
  // Combine refs
  const handleRef = React.useCallback((node: HTMLDivElement | null) => {
    overlayRef.current = node;
    
    // Forward ref
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);
  
  // Ensure proper cleanup when dialog state changes
  React.useEffect(() => {
    return () => {
      if (overlayRef.current && overlayRef.current.parentNode) {
        console.log("Dialog overlay unmounted, checking for orphaned nodes");
      }
    };
  }, []);
  
  return (
    <DialogPrimitive.Overlay 
      ref={handleRef}
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", 
        className
      )}
      {...props} 
    />
  );
});

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Enhanced content component with unmount tracking
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  hideCloseButton?: boolean;
}>((props, ref) => {
  const { 
    className, 
    children, 
    hideCloseButton = false,
    onCloseAutoFocus,
    ...restProps 
  } = props;
  
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isUnmounting, setIsUnmounting] = React.useState(false);
  
  // Handle proper cleanup when dialog content unmounts
  const handleCleanup = React.useCallback(() => {
    console.log("Dialog cleanup triggered");
    
    // Dispatch event for global tracking
    const event = new CustomEvent('dialogClosed', { 
      bubbles: true,
      detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }, []);
  
  // Enhanced close behavior
  const handleCloseAutoFocus = React.useCallback((event: Event) => {
    // Mark as unmounting to trigger cleanup
    setIsUnmounting(true);
    
    // Call original handler if provided
    if (onCloseAutoFocus) {
      onCloseAutoFocus(event);
    }
  }, [onCloseAutoFocus]);
  
  // Ensure proper cleanup on unmount
  React.useEffect(() => {
    if (isUnmounting) {
      handleCleanup();
    }
    
    return () => {
      handleCleanup();
    };
  }, [isUnmounting, handleCleanup]);
  
  return (
    <DialogPortal onCleanup={handleCleanup}>
      <DialogOverlay />
      <DialogPrimitive.Content 
        ref={(node) => {
          contentRef.current = node;
          
          // Forward ref
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full", 
          className
        )}
        onCloseAutoFocus={handleCloseAutoFocus}
        {...restProps}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close 
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4 px-0 py-0 my-[-9px] bg-slate-700 mx-[-9px]" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({
  className,
  ...props
}, ref) => (
  <DialogPrimitive.Title 
    ref={ref} 
    className={cn("text-lg font-semibold leading-none tracking-tight", className)} 
    {...props} 
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({
  className,
  ...props
}, ref) => (
  <DialogPrimitive.Description 
    ref={ref} 
    className={cn("text-sm text-muted-foreground", className)} 
    {...props} 
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
};
