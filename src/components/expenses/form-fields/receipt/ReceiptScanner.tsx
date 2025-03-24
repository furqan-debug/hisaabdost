
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ReceiptScanResult, ScanResult } from "@/hooks/expense-form/types";
import { useQueryClient } from "@tanstack/react-query";
import { uploadReceipt } from "@/utils/receiptUtils";

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
  const queryClient = useQueryClient();

  // Check if we have a receipt image to scan
  const canScanReceipt = !!receiptUrl && !!receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i);

  const handleScanReceipt = async () => {
    // Get file element by id
    const fileInput = document.getElementById('expense-receipt') as HTMLInputElement;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
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
      
      // First upload to Supabase storage to get a permanent URL
      let storageUrl = receiptUrl;
      if (!receiptUrl.includes('supabase.co')) {
        const uploadedUrl = await uploadReceipt(file);
        if (uploadedUrl) {
          storageUrl = uploadedUrl;
        }
      }
      
      const formData = new FormData();
      formData.append('receipt', file);

      console.log("Sending receipt to scan-receipt function");
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
      });

      console.log("Scan receipt response:", data, error);

      if (error) {
        console.error("Supabase function error:", error);
        toast.dismiss(scanToast);
        toast.error(`Scanning error: ${error.message || "Failed to scan receipt"}`);
        setIsScanning(false);
        return;
      }
      
      // Check response
      if (!data) {
        toast.dismiss(scanToast);
        toast.error("No data returned from receipt scanner");
        setIsScanning(false);
        return;
      }

      // Proceed if we have valid item data
      if (data && data.success) {
        console.log("Receipt scan success. Items:", data.items);
        const items = data.items || [];
        
        if (items.length === 0) {
          toast.dismiss(scanToast);
          toast.error("Unable to extract any items from the receipt");
          setIsScanning(false);
          return;
        }
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          toast.dismiss(scanToast);
          toast.error("You must be logged in to add expenses");
          setIsScanning(false);
          return;
        }
        
        const userId = userData.user.id;
        let successCount = 0;
        
        // Process each item from the receipt and add to Supabase
        for (const item of items) {
          // Format the amount correctly
          const amount = parseFloat(item.amount.replace(/[^\d.]/g, ''));
          
          if (isNaN(amount) || amount <= 0) {
            console.log("Skipping item with invalid amount:", item);
            continue;
          }
          
          // Extract date
          let expenseDate = new Date().toISOString().split('T')[0]; // Default to today
          if (item.date) {
            try {
              const date = new Date(item.date);
              if (!isNaN(date.getTime())) {
                expenseDate = date.toISOString().split('T')[0];
              }
            } catch (e) {
              console.log("Error parsing date from receipt item:", e);
            }
          }
          
          // Insert the expense into Supabase
          const { error: insertError } = await supabase.from('expenses').insert([{
            user_id: userId,
            description: item.name,
            amount: amount,
            date: expenseDate,
            category: item.category || "Groceries",
            payment: "Card", // Default payment method
            is_recurring: false,
            notes: "Added from receipt scan",
            receipt_url: storageUrl || null
          }]);
          
          if (insertError) {
            console.error("Error adding item to expenses:", insertError);
          } else {
            successCount++;
          }
        }
        
        // Invalidate expenses query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        
        toast.dismiss(scanToast);
        
        if (successCount > 0) {
          toast.success(`Successfully added ${successCount} items from the receipt!`);
        } else {
          toast.error("Could not add any items from the receipt");
        }
        
        // Also support the original callback flows
        if (onItemsExtracted) {
          const receiptData: ReceiptScanResult = {
            storeName: data.storeName || "Store", 
            date: items[0].date || new Date().toLocaleDateString(),
            items: items.map((item: any) => ({
              name: item.name,
              amount: item.amount.replace('$', ''),
              category: item.category
            })),
            total: items.reduce((sum: number, item: any) => {
              const amount = parseFloat(item.amount.replace(/[^\d.]/g, ''));
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0).toFixed(2),
            paymentMethod: "Card" // Default payment method
          };
          
          onItemsExtracted(receiptData);
        }
        
        // Also support the original single-item flow
        if (onScanComplete && items.length > 0) {
          // Use the first item for the single expense flow
          const firstItem = items[0];
          
          const extractedData: ScanResult = {
            description: firstItem.name,
            amount: firstItem.amount.replace('$', ''),
            date: firstItem.date ? convertDateFormat(firstItem.date) : new Date().toISOString().split('T')[0],
            category: firstItem.category || "Shopping",
            paymentMethod: "Card",
            storeName: data.storeName || "" 
          };
          
          onScanComplete(extractedData);
        }
      } else {
        toast.dismiss(scanToast);
        toast.error(data.error || "Could not extract data from receipt. Please try again or enter details manually.");
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
