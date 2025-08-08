import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ReceiptScanDialog } from "./receipt/ReceiptScanDialog";
import { useNativeCamera } from "@/hooks/useNativeCamera";

interface ReceiptFieldProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFileInputRef?: (ref: HTMLInputElement | null) => void;
  setCameraInputRef?: (ref: HTMLInputElement | null) => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  autoProcess?: boolean;
}

export function ReceiptField({
  receiptUrl,
  onFileChange,
  setFileInputRef,
  setCameraInputRef,
  onCapture,
  autoProcess = true
}: ReceiptFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { capturePhoto } = useNativeCamera();

  // Set refs for parent component access
  if (setFileInputRef && fileInputRef.current) {
    setFileInputRef(fileInputRef.current);
  }
  if (setCameraInputRef && cameraInputRef.current) {
    setCameraInputRef(cameraInputRef.current);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`📁 File selected: ${file.name} (${file.size} bytes, ${file.type})`);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // If autoProcess is enabled, open scan dialog immediately
    if (autoProcess) {
      console.log("🚀 Auto-processing enabled, opening scan dialog");
      setScanDialogOpen(true);
    } else {
      // For manual mode, just call the parent's onFileChange
      onFileChange(e);
    }
  };

  const handleNativeCamera = async () => {
    setIsCapturing(true);
    try {
      console.log("📸 Starting native camera capture...");
      const photo = await capturePhoto();
      
      if (photo) {
        console.log(`📷 Photo captured: ${photo.name} (${photo.size} bytes)`);
        setSelectedFile(photo);
        
        const url = URL.createObjectURL(photo);
        setPreviewUrl(url);
        
        if (autoProcess) {
          console.log("🚀 Auto-processing camera photo");
          setScanDialogOpen(true);
        } else {
          // Create a synthetic event for manual mode
          const syntheticEvent = {
            target: { files: [photo] }
          } as React.ChangeEvent<HTMLInputElement>;
          onFileChange(syntheticEvent);
        }
      }
    } catch (error) {
      console.error("📸 Camera capture failed:", error);
      toast.error("Failed to capture photo");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleScanSuccess = () => {
    console.log("✅ Receipt scan completed successfully");
    toast.success("Receipt processed successfully!");
    
    // Clean up after successful scan
    setTimeout(() => {
      handleRemoveFile();
    }, 1000);
  };

  const handleDialogClose = () => {
    setScanDialogOpen(false);
  };

  const handleCleanup = () => {
    console.log("🧹 Cleaning up receipt scan resources");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="receipt" className="text-sm font-medium">
        Receipt Image
      </Label>
      
      {/* File Input Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
          disabled={isCapturing}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNativeCamera}
          className="flex-1"
          disabled={isCapturing}
        >
          {isCapturing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          {isCapturing ? "Capturing..." : "Take Photo"}
        </Button>
      </div>

      {/* Hidden File Inputs */}
      <Input
        ref={fileInputRef}
        id="receipt"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview Section */}
      {selectedFile && previewUrl && (
        <div className="relative">
          <div className="border border-dashed border-muted-foreground/25 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Receipt URL Display */}
      {receiptUrl && !selectedFile && (
        <div className="text-sm text-muted-foreground">
          Receipt uploaded successfully
        </div>
      )}

      {/* Scan Dialog */}
      <ReceiptScanDialog
        file={selectedFile}
        previewUrl={previewUrl}
        open={scanDialogOpen}
        setOpen={setScanDialogOpen}
        onCleanup={handleCleanup}
        onCapture={onCapture}
        autoSave={true}
        autoProcess={autoProcess}
        onSuccess={handleScanSuccess}
      />
    </div>
  );
}
