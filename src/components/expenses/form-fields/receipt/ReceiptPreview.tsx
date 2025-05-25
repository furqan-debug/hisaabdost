
import { ReceiptPreviewImage } from "./ReceiptPreviewImage";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface ReceiptPreviewProps {
  receiptUrl: string | null;
  onReplace?: (() => void) | null;
  className?: string;
  disabled?: boolean;
}

export function ReceiptPreview({ 
  receiptUrl, 
  onReplace, 
  className = "",
  disabled = false
}: ReceiptPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  console.log("ReceiptPreview received URL:", receiptUrl);

  if (!receiptUrl) {
    return (
      <div className="rounded-md border bg-muted h-[150px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No receipt uploaded</p>
      </div>
    );
  }

  const handleImageLoad = () => {
    console.log("ReceiptPreview image loaded");
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.log("ReceiptPreview image failed to load");
    setIsLoading(false);
  };

  return (
    <div 
      className={`relative border rounded-md overflow-hidden ${disabled ? 'opacity-75' : 'opacity-100'}`}
      onClick={!disabled && onReplace ? onReplace : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <ReceiptPreviewImage 
        url={receiptUrl} 
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-auto object-contain ${className}`}
      />
      {!disabled && onReplace && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <div className="text-xs text-white bg-black/70 px-2 py-1 rounded">
            Click to replace
          </div>
        </div>
      )}
    </div>
  );
}
