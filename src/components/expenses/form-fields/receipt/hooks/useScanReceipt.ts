
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface UseScanReceiptProps {
  file: File | null;
  onCleanup: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  autoSave?: boolean;
  setOpen: (open: boolean) => void;
}

export function useScanReceipt({
  file,
  onCleanup,
  onCapture,
  autoSave = false,
  setOpen
}: UseScanReceiptProps) {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [scanTimer, setScanTimer] = useState<number | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTimedOut, setScanTimedOut] = useState(false);

  // Cleanup timers when component unmounts or when scanning stops
  useEffect(() => {
    return () => {
      if (scanTimer) {
        clearTimeout(scanTimer);
      }
    };
  }, [scanTimer]);

  // Reset states when dialog is opened
  useEffect(() => {
    setScanProgress(0);
    setScanTimedOut(false);
  }, []);

  // Save expense data to the database
  const saveExpenseToDatabase = async (expense: {
    description: string;
    amount: number;
    date: string;
    category: string;
    paymentMethod: string;
  }) => {
    try {
      console.log("Saving expense:", expense);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        toast.error("You must be logged in to add expenses");
        return false;
      }
      
      const { error } = await supabase.from('expenses').insert([{
        user_id: userData.user.id,
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

  // Handle the visual progress updates during scanning
  useEffect(() => {
    if (isScanning) {
      const progressInterval = window.setInterval(() => {
        setScanProgress(prev => {
          // Slowly increase progress up to 85%, then wait for actual completion
          const increment = prev < 30 ? 2 : prev < 60 ? 1 : prev < 85 ? 0.5 : 0;
          return Math.min(prev + increment, 85);
        });
      }, 200);

      // Set a timer to show a message if scanning takes too long
      const infoTimer = window.setTimeout(() => {
        toast.info("Scanning is taking longer than expected. Please be patient...");
      }, 5000);
      
      // Set a timeout timer
      const timeoutTimer = window.setTimeout(() => {
        setScanTimedOut(true);
        setIsScanning(false);
        toast.error("Receipt scanning timed out. Please try again with a clearer image.");
      }, 20000);
      
      setScanTimer(timeoutTimer);
      
      return () => {
        window.clearInterval(progressInterval);
        window.clearTimeout(infoTimer);
        window.clearTimeout(timeoutTimer);
      };
    } else if (!isScanning && scanProgress > 0 && !scanTimedOut) {
      // When scanning completes successfully, finish the progress animation
      const finalizeInterval = window.setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            window.clearInterval(finalizeInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      
      return () => {
        window.clearInterval(finalizeInterval);
      };
    }
    
    return undefined;
  }, [isScanning, scanProgress, scanTimedOut]);

  // The main scan receipt function
  const handleScanReceipt = async () => {
    if (!file) {
      toast.error("No receipt image to scan");
      return;
    }

    setScanTimedOut(false);
    setIsScanning(true);
    setScanProgress(0);
    const scanToast = toast.loading("Scanning your receipt...");
    
    try {
      console.log("Processing receipt scan with file:", file.name, file.type);
      
      // Create a new FormData and optimize for camera captures
      const formData = new FormData();
      
      // For camera captures, create a new file with JPEG mimetype and compress if needed
      if (file.type.includes('image')) {
        try {
          // Use canvas to resize and compress the image
          const img = new Image();
          const loadPromise = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
          
          await loadPromise;
          
          // Get optimal dimensions while maintaining aspect ratio
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with reduced quality for large images
          const blob = await new Promise<Blob>(resolve => {
            canvas.toBlob(
              blob => resolve(blob!), 
              'image/jpeg', 
              file.size > 2 * 1024 * 1024 ? 0.7 : 0.9
            );
          });
          
          const jpegFile = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          formData.append('receipt', jpegFile);
          console.log("Optimized camera capture: original size", file.size, "new size", jpegFile.size);
          
          // Revoke the object URL to prevent memory leaks
          URL.revokeObjectURL(img.src);
        } catch (err) {
          console.warn("Failed to optimize image, using original:", err);
          formData.append('receipt', file);
        }
      } else {
        formData.append('receipt', file);
      }

      // Add a timeout for the function call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      
      try {
        const { data, error } = await supabase.functions.invoke('scan-receipt', {
          body: formData,
        });
        
        clearTimeout(timeoutId);

        if (error) {
          console.error("Supabase function error:", error);
          throw new Error(error.message || 'Failed to scan receipt');
        }

        console.log("Receipt scan response:", data);
        setScanProgress(100);
        
        if (data && data.success && data.receiptData) {
          const receiptData = data.receiptData;
          console.log("Receipt data:", receiptData);
          
          // Ensure we have a valid date
          if (!receiptData.date || receiptData.date === "Invalid Date") {
            receiptData.date = new Date().toISOString().split('T')[0];
          }
          
          if (autoSave && receiptData.items && receiptData.items.length > 0) {
            // If autoSave is enabled, save all items directly
            toast.dismiss(scanToast);
            toast.loading("Adding expenses from receipt...", { id: "adding-expenses" });
            
            let savedCount = 0;
            
            // Get the current user
            const { data: userData } = await supabase.auth.getUser();
            if (!userData || !userData.user) {
              toast.error("You must be logged in to add expenses");
              return;
            }
            
            // Save each item as a separate expense
            for (const item of receiptData.items) {
              // Skip items with empty names or zero amounts
              if (!item.name || parseFloat(item.amount) <= 0) {
                console.log("Skipping invalid item:", item);
                continue;
              }
              
              console.log("Saving item:", item);
              const { error } = await supabase.from('expenses').insert([{
                user_id: userData.user.id,
                description: item.name,
                amount: parseFloat(item.amount),
                date: receiptData.date,
                category: item.category || "Groceries",
                payment: receiptData.paymentMethod || "Card",
                is_recurring: false,
                notes: `From ${receiptData.storeName} receipt`
              }]);
              
              if (!error) savedCount++;
              else console.error("Error saving item:", error);
            }
            
            // Refresh the expenses list
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            
            toast.dismiss("adding-expenses");
            if (savedCount > 0) {
              toast.success(`Added ${savedCount} expense items from receipt`);
            } else {
              toast.error("Failed to add expenses from receipt");
            }
            
            setOpen(false);
          } else if (onCapture && receiptData.items && receiptData.items.length > 0) {
            // If onCapture is provided, use the first item
            const firstItem = receiptData.items[0];
            onCapture({
              description: firstItem.name,
              amount: firstItem.amount,
              date: receiptData.date,
              category: firstItem.category || "Groceries",
              paymentMethod: receiptData.paymentMethod || "Card"
            });
            
            toast.dismiss(scanToast);
            toast.success("Receipt details extracted. Found " + receiptData.items.length + " items!");
          } else if (onCapture) {
            // Fallback to single item if no items found
            onCapture({
              description: receiptData.storeName || "Store purchase",
              amount: receiptData.total || "0.00",
              date: receiptData.date,
              category: "Shopping",
              paymentMethod: receiptData.paymentMethod || "Card"
            });
            
            toast.dismiss(scanToast);
            toast.success("Receipt details extracted successfully!");
          }
        } else {
          console.error("Invalid data format received:", data);
          toast.dismiss(scanToast);
          toast.error(data?.error || "Failed to extract information from receipt");
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          setScanTimedOut(true);
          console.error("Receipt scanning timed out");
          toast.dismiss(scanToast);
          toast.error("Receipt scanning is taking too long. Please try again with a clearer image or enter details manually.");
        } else {
          console.error("Receipt scanning error:", error);
          toast.dismiss(scanToast);
          toast.error("Receipt scanning failed. Please try again or enter details manually.");
        }
      }
    } catch (error) {
      console.error("Receipt preparation error:", error);
      toast.dismiss(scanToast);
      toast.error("Could not process the receipt image. Please try again with a different image.");
    } finally {
      setIsScanning(false);
      if (scanTimer) {
        clearTimeout(scanTimer);
        setScanTimer(null);
      }
    }
  };

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    handleScanReceipt
  };
}
