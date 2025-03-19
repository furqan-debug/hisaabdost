
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";

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
      <div className="grid grid-cols-2 gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            onUpload();
          }}
          disabled={disabled}
          className="flex items-center justify-center px-3 py-2"
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
          className="flex items-center justify-center px-3 py-2"
        >
          {showIcons && <Camera className="mr-2 h-4 w-4" />}
          Take Photo
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground text-center mt-1">
        Uploaded receipts are automatically scanned using Google Vision AI
      </div>
    </div>
  );
}
