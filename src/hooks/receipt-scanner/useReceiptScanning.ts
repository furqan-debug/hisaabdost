
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useFallbackScanning } from "./useFallbackScanning";
import { useReceiptProcessing } from "./useReceiptProcessing";

export function useReceiptScanning() {
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();
  const { handleFallbackParsing } = useFallbackScanning();
  const { processExtractedItems } = useReceiptProcessing();

  const scanReceipt = async (file: File, storageUrl: string) => {
    if (!file) {
      toast.error("No receipt image to scan");
      return;
    }

    setIsScanning(true);
    const scanToast = toast.loading("Scanning receipt...");
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        body: formData,
      });

      if (error || !data) {
        console.error("Scan error:", error);
        handleFallbackParsing(file, storageUrl, scanToast.toString());
        return;
      }

      if (data.success) {
        const items = data.items || [];
        if (items.length === 0) {
          handleFallbackParsing(file, storageUrl, scanToast.toString());
          return;
        }
        
        processExtractedItems(items, data.storeName, storageUrl, scanToast.toString());
      } else {
        handleFallbackParsing(file, storageUrl, scanToast.toString());
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      handleFallbackParsing(file, storageUrl, scanToast.toString());
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    scanReceipt
  };
}
