
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ReceiptPreview } from "./receipt/ReceiptPreview";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ReceiptFieldProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFileInputRef?: (ref: HTMLInputElement | null) => void;
  setCameraInputRef?: (ref: HTMLInputElement | null) => void;
}

export function ReceiptField({ 
  receiptUrl, 
  onFileChange,
  setFileInputRef,
  setCameraInputRef
}: ReceiptFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Expose the refs to the parent component if needed
  useEffect(() => {
    if (setFileInputRef && fileInputRef.current) {
      setFileInputRef(fileInputRef.current);
    }
    
    if (setCameraInputRef && cameraInputRef.current) {
      setCameraInputRef(cameraInputRef.current);
    }
  }, [setFileInputRef, setCameraInputRef]);
  
  // Check if device is mobile or has camera capabilities
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
  }, []);

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="expense-receipt">Receipt</Label>
      <div className="space-y-2">
        <ReceiptPreview 
          receiptUrl={receiptUrl} 
          onReplace={handleUpload} 
        />
        
        {/* Hidden file input for regular uploads */}
        <Input
          id="expense-receipt"
          name="receipt"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        
        {/* Hidden file input specifically for camera capture */}
        <Input
          id="camera-capture"
          name="camera"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          ref={cameraInputRef}
          className="hidden"
        />
        
        {receiptUrl ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleUpload}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Replace Receipt
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUpload}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Receipt
            </Button>
            
            {isMobile && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
