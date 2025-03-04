
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, ScanLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

interface ReceiptCaptureProps {
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  disabled?: boolean;
  autoSave?: boolean;
}

export function ReceiptCapture({ onCapture, disabled = false, autoSave = false }: ReceiptCaptureProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  const saveExpenseToDatabase = async (expense: {
    description: string;
    amount: number;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    if (!user) {
      toast.error("You must be logged in to add expenses");
      return false;
    }
    
    try {
      const { error } = await supabase.from('expenses').insert([{
        user_id: user.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
        payment: expense.paymentMethod,
        is_recurring: false
      }]);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error saving expense:", error);
      return false;
    }
  };

  const handleScanReceipt = async () => {
    if (!file) {
      toast.error("No receipt image to scan");
      return;
    }

    setIsScanning(true);
    const scanToast = toast.loading("Scanning your receipt...");
    
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
      
      if (data && data.success && data.receiptData) {
        const receiptData = data.receiptData;
        
        if (autoSave && user) {
          // If autoSave is enabled, save all items directly
          toast.dismiss(scanToast);
          toast.loading("Adding expenses from receipt...", { id: "adding-expenses" });
          
          let savedCount = 0;
          const itemCount = receiptData.items.length;
          
          // Save each item as a separate expense
          for (const item of receiptData.items) {
            const success = await saveExpenseToDatabase({
              description: item.name,
              amount: parseFloat(item.amount),
              date: receiptData.date,
              category: item.category || "Food",
              paymentMethod: receiptData.paymentMethod
            });
            
            if (success) savedCount++;
          }
          
          // Refresh the expenses list
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
          
          toast.dismiss("adding-expenses");
          if (savedCount > 0) {
            toast.success(`Added ${savedCount} expense(s) from receipt`);
          } else {
            toast.error("Failed to add expenses from receipt");
          }
          
          setShowDialog(false);
        } else if (onCapture) {
          // If onCapture is provided, use the first item or default to store data
          if (receiptData.items.length > 0) {
            const firstItem = receiptData.items[0];
            onCapture({
              description: firstItem.name,
              amount: firstItem.amount,
              date: receiptData.date,
              category: firstItem.category || "Food",
              paymentMethod: receiptData.paymentMethod
            });
          } else {
            onCapture({
              description: receiptData.storeName,
              amount: receiptData.total,
              date: receiptData.date,
              category: "Food",
              paymentMethod: receiptData.paymentMethod
            });
          }
          toast.dismiss(scanToast);
          toast.success("Receipt details extracted successfully!");
        }
      } else {
        console.error("Invalid data format received:", data);
        toast.dismiss(scanToast);
        toast.error(data?.error || "Failed to extract information from receipt");
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      toast.dismiss(scanToast);
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
          <DialogDescription>
            {autoSave 
              ? "We'll extract all items and save them automatically" 
              : "We'll extract the store name, amount, date and other details"}
          </DialogDescription>
          
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
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ScanLine className="mr-2 h-4 w-4" />
                    {autoSave ? "Extract & Save All Items" : "Extract Data"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
