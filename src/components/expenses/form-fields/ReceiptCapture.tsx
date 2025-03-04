
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface ReceiptCaptureProps {
  onCapture: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  disabled?: boolean;
}

export function ReceiptCapture({ onCapture, disabled = false }: ReceiptCaptureProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.match('image.*') && selectedFile.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setShowDialog(true);
    }
  };

  const handleScanReceipt = async () => {
    if (!file) {
      toast.error("No receipt image to scan");
      return;
    }

    setIsScanning(true);
    try {
      console.log("Processing receipt scan with file:", file.name, file.type);
      const formData = new FormData();
      formData.append('receipt', file);

      // Make sure we're accessing the edge function correctly
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || 'Failed to scan receipt');
      }

      console.log("Receipt scan response:", data);
      
      if (data && data.success && data.expenseDetails) {
        toast.success("Receipt details extracted successfully!");
        onCapture(data.expenseDetails);
        setShowDialog(false);
      } else {
        console.error("Invalid data format received:", data);
        toast.error(data?.error || "Failed to extract information from receipt");
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      toast.error("Receipt scanning failed. Please try again or enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const capturePhoto = () => {
    const input = document.getElementById('receipt-upload') as HTMLInputElement;
    if (input) {
      input.setAttribute('capture', 'environment');
      input.click();
    }
  };

  const uploadFile = () => {
    const input = document.getElementById('receipt-upload') as HTMLInputElement;
    if (input) {
      input.removeAttribute('capture');
      input.click();
    }
  };

  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFile(null);
    setShowDialog(false);
  };

  return (
    <>
      <input
        id="receipt-upload"
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Card className="p-4 bg-background border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer">
        <div className="flex flex-col items-center gap-3 py-3">
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={uploadFile}
              disabled={disabled}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Receipt
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={capturePhoto}
              disabled={disabled}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground mt-2">
            Upload or take a photo of your receipt for automatic expense entry
          </div>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) cleanupPreview();
        setShowDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Scan Receipt</DialogTitle>
          
          <div className="flex flex-col items-center space-y-4">
            {previewUrl && (
              <div className="relative w-full max-h-64 overflow-hidden rounded-md border">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full object-contain"
                />
              </div>
            )}
            
            <div className="flex w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={cleanupPreview}
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                onClick={handleScanReceipt}
                disabled={isScanning || !file}
              >
                {isScanning ? 'Scanning...' : 'Extract Data'}
                <ScanLine className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
