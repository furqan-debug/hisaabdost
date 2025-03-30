
import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface ReceiptPreviewImageProps {
  url: string;
  alt?: string;
  className?: string;
  isProcessing?: boolean;
}

export function ReceiptPreviewImage({
  url,
  alt = "Receipt preview",
  className,
  isProcessing = false,
}: ReceiptPreviewImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className="relative rounded-md overflow-hidden">
      {isLoading && !hasError && (
        <Skeleton className="w-full aspect-[3/4] rounded-md" />
      )}
      
      <motion.div 
        className={cn(
          "relative rounded-md overflow-hidden",
          isProcessing && "animate-scan-line border-2 border-primary",
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={url}
          alt={alt}
          className={cn(
            "w-full h-auto object-contain rounded-md",
            isLoading && "hidden"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
        
        {isProcessing && (
          <motion.div 
            className="absolute inset-0 bg-primary/5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.1, 0, 0.1, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
        )}
      </motion.div>
      
      {hasError && (
        <div className="w-full aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Failed to load image</p>
        </div>
      )}
    </div>
  );
}
