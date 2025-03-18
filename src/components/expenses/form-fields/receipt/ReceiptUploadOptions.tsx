
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
    <Card className="p-4 bg-background border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer">
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              onUpload();
            }}
            disabled={disabled}
            className="w-full"
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
            className="w-full"
          >
            {showIcons && <Camera className="mr-2 h-4 w-4" />}
            Take Photo
          </Button>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          Upload a receipt image or take a photo to automatically extract expense details
        </div>
      </div>
    </Card>
  );
}
