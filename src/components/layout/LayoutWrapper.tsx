
import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden max-w-[100vw] safe-area-supported">
      <style jsx>{`
        .safe-area-supported {
          /* Handle different device types */
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          padding-left: env(safe-area-inset-left, 0px);
          padding-right: env(safe-area-inset-right, 0px);
        }
        
        /* Specific handling for devices with notches */
        @supports (padding: max(0px)) {
          .safe-area-supported {
            padding-top: max(env(safe-area-inset-top, 0px), 0px);
          }
        }
      `}</style>
      {children}
    </div>
  );
}
