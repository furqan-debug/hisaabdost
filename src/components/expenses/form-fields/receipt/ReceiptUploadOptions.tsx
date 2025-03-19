
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReceiptUploadOptionsProps {
  onUpload: () => void;
  onCapture: () => void;
  disabled?: boolean;
  showIcons?: boolean;
}

export function ReceiptUploadOptions({ 
  onUpload, 
  onCapture, 
  disabled = false,
  showIcons = true 
}: ReceiptUploadOptionsProps) {
  return (
    <div className="space-y-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={(e) => {
          e.stopPropagation();
          onUpload();
        }}
        disabled={disabled}
        className="w-full flex items-center justify-center px-3 py-2"
      >
        {showIcons && <Upload className="mr-2 h-4 w-4" />}
        Upload Receipt
      </Button>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={(e) => {
          e.stopPropagation();
          onCapture();
        }}
        disabled={disabled}
        className="w-full flex items-center justify-center px-3 py-2"
      >
        {showIcons && <Camera className="mr-2 h-4 w-4" />}
        Take Photo
      </Button>
      
      <div className="text-xs text-muted-foreground text-center mt-1">
        Upload a receipt image or take a photo to extract expense details
      </div>
    </div>
  );
}
