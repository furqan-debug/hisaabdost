
import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden max-w-[100vw]">
      {children}
    </div>
  );
}
