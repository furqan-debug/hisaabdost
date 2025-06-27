
import React from "react";

interface OptimizedLoadingScreenProps {
  message?: string;
}

export const OptimizedLoadingScreen: React.FC<OptimizedLoadingScreenProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      <div className="flex flex-col items-center p-4">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3"></div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
