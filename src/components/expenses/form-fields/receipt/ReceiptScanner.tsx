
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ReceiptScanResult, ScanResult } from "@/hooks/expense-form/types";

interface ReceiptScannerProps {
  receiptUrl: string;
  onScanComplete?: (expenseDetails: ScanResult) => void;
  onItemsExtracted?: (receiptData: ReceiptScanResult) => void;
}

export function useReceiptScanner({ 
  receiptUrl, 
  onScanComplete,
  onItemsExtracted 
}: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  // Check if we have a receipt image to scan
  const canScanReceipt = !!receiptUrl && !!receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i);

  const handleScanReceipt = async () => {
    const fileInput = document.getElementById('expense-receipt') as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      toast.error("Please upload a receipt image first");
      return;
    }

    setIsScanning(true);
    const scanToast = toast.loading("Scanning receipt...");
    
    try {
      const file = fileInput.files[0];
      console.log(`Scanning receipt: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      
      // Check if file is too large
      if (file.size > 8 * 1024 * 1024) {
        toast.dismiss(scanToast);
        toast.error("Receipt image is too large. Please use an image smaller than 8MB.");
        setIsScanning(false);
        return;
      }
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.dismiss(scanToast);
        toast.error("Please upload an image file (JPG, PNG, etc.)");
        setIsScanning(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('receipt', file);

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
      });

      if (error) {
        console.error("Supabase function error:", error);
        toast.dismiss(scanToast);
        toast.error(`Scanning error: ${error.message || "Failed to scan receipt"}`);
        setIsScanning(false);
        return;
      }
      
      // Check response
      if (data && data.success && data.items && data.items.length > 0) {
        toast.dismiss(scanToast);
        toast.success("Receipt scanned successfully!");
        
        const receiptItems = data.items;
        console.log("Extracted receipt data:", receiptItems);
        
        // Process the items
        if (onItemsExtracted) {
          // Calculate total
          const total = receiptItems.reduce((sum: number, item: any) => {
            const amount = parseFloat(item.amount.replace('$', ''));
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0).toFixed(2);
          
          // Create receipt data structure
          const receiptData: ReceiptScanResult = {
            storeName: "Store", // We don't extract store name in the new implementation
            date: receiptItems[0].date, // Use the date from the first item
            items: receiptItems.map((item: any) => ({
              name: item.name,
              amount: item.amount.replace('$', ''),
              category: item.category
            })),
            total: total,
            paymentMethod: "Card" // Default payment method
          };
          
          onItemsExtracted(receiptData);
        }
        
        // Also support the original single-item flow
        if (onScanComplete && receiptItems.length > 0) {
          // Use the first item for the single expense flow
          const firstItem = receiptItems[0];
          
          const extractedData: ScanResult = {
            description: firstItem.name,
            amount: firstItem.amount.replace('$', ''),
            date: firstItem.date ? convertDateFormat(firstItem.date) : new Date().toISOString().split('T')[0],
            category: firstItem.category || "Shopping",
            paymentMethod: "Card",
            storeName: "" // We don't extract store name in the new implementation
          };
          
          onScanComplete(extractedData);
        }
      } else if (data && !data.success) {
        toast.dismiss(scanToast);
        console.error("Receipt scan error:", data.error);
        toast.error(data.error || "Failed to extract information from receipt");
      } else {
        toast.dismiss(scanToast);
        toast.error("Receipt scanning failed. Please try uploading a clearer image.");
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      toast.dismiss(scanToast);
      toast.error("Receipt scanning failed. Please try again or enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  // Helper function to convert date format from "Mar 23, 2025" to "2025-03-23"
  function convertDateFormat(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  }

  return {
    isScanning,
    canScanReceipt,
    handleScanReceipt
  };
}
