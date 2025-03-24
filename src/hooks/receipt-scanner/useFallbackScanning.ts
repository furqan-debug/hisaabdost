
import { toast } from "sonner";
import { generateFallbackItems } from "@/utils/receiptParser";
import { useReceiptProcessing } from "./useReceiptProcessing";

export function useFallbackScanning() {
  const { processExtractedItems } = useReceiptProcessing();

  const handleFallbackParsing = async (file: File, storageUrl: string, scanToast: string) => {
    console.log("Using fallback parsing mechanism");
    try {
      const fallbackItems = generateFallbackItems();
      const storeName = "Store";
      const today = new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      
      processExtractedItems(
        fallbackItems.map(item => ({
          name: item.name,
          amount: item.amount,
          date: today,
          category: "Groceries"
        })), 
        storeName, 
        storageUrl, 
        scanToast
      );
    } catch (error) {
      console.error("Error in fallback parsing:", error);
      toast.dismiss(scanToast);
      toast.error("Failed to process receipt. Please enter details manually.");
    }
  };

  return { handleFallbackParsing };
}
