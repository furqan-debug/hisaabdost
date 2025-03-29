
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { processScanResults } from '../utils/processScanUtils';
import { useScanProcess } from './useScanProcess';

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
  setOpen?: (open: boolean) => void;
  onSuccess?: () => void; // Added the missing onSuccess callback property
}

// Custom event to notify about receipt scanning completion
const dispatchReceiptScanned = () => {
  console.log("Dispatching receipt-scanned event");
  const event = new CustomEvent('receipt-scanned', { 
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(event);
};

export function useScanReceipt({
  file,
  onCleanup,
  onCapture,
  autoSave = true,
  setOpen,
  onSuccess
}: UseScanReceiptProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTimedOut, setScanTimedOut] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Define status update handler
  const updateProgress = useCallback((progress: number, message?: string) => {
    setScanProgress(progress);
    if (message) {
      setStatusMessage(message);
    }
  }, []);

  // Define handlers for scan completion/error
  const endScan = useCallback(() => {
    setIsScanning(false);
    setIsAutoProcessing(false);
    setScanTimedOut(false);
    setScanError(null);
    
    // Dispatch event to notify UI that receipt was scanned
    dispatchReceiptScanned();

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  }, [onSuccess]);
  
  const timeoutScan = useCallback(() => {
    setIsScanning(false);
    setIsAutoProcessing(false);
    setScanTimedOut(true);
    setStatusMessage('Scan timed out. Please try again or enter details manually.');
    toast.error('Receipt scan timed out');
  }, []);
  
  const errorScan = useCallback((message: string) => {
    setIsScanning(false);
    setIsAutoProcessing(false);
    setScanError(message);
    setStatusMessage(message);
    toast.error(message);
  }, []);
  
  // Use the scan process hook
  const { processScan } = useScanProcess({
    updateProgress,
    endScan,
    timeoutScan,
    errorScan
  });
  
  // Handle manual scan initiation
  const handleScanReceipt = useCallback(async () => {
    if (!file) {
      toast.error('No receipt file selected');
      return;
    }
    
    try {
      setIsScanning(true);
      setScanTimedOut(false);
      setScanError(null);
      setScanProgress(10);
      setStatusMessage('Processing receipt image...');
      
      console.log(`Manual scanning receipt: ${file.name} (${file.size} bytes, ${file.type})`);
      
      // Create form data for the scan
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', Date.now().toString());
      formData.append('retry', '0');
      formData.append('enhanced', 'true');
      
      console.log("Form data entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`- ${key}: ${value instanceof File ? 'File(' + value.name + ', ' + value.size + ' bytes, ' + value.type + ')' : value}`);
      }
      
      // Process the scan
      const scanResult = await processScan(formData);
      
      if (scanResult) {
        console.log("Scan function response:", JSON.stringify(scanResult, null, 2));
        
        console.log("Processing scan results...");
        // Process the scan results
        await processScanResults(scanResult, autoSave, onCapture, setOpen);
      } else {
        // Handle empty result
        setScanProgress(0);
        setIsScanning(false);
        setStatusMessage('Failed to process receipt');
        toast.error('Failed to process receipt');
      }
    } catch (error) {
      console.error('Error scanning receipt:', error);
      setIsScanning(false);
      setStatusMessage('Error processing receipt');
      toast.error('Error processing receipt');
    }
  }, [file, autoSave, onCapture, setOpen, processScan]);
  
  // Handle auto-processing of the receipt
  const autoProcessReceipt = useCallback(async () => {
    if (!file) {
      return;
    }
    
    try {
      setIsAutoProcessing(true);
      setScanTimedOut(false);
      setScanError(null);
      setScanProgress(10);
      setStatusMessage('Processing receipt image...');
      
      console.log(`Auto-processing receipt: ${file.name} (${file.size} bytes, ${file.type})`);
      
      // Create form data for the scan
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', Date.now().toString());
      formData.append('retry', '0');
      formData.append('enhanced', 'true');
      
      // Process the scan
      const scanResult = await processScan(formData);
      
      if (scanResult) {
        console.log("Auto-scan function response:", scanResult);
        
        // Process the scan results
        await processScanResults(scanResult, autoSave, onCapture, setOpen);
      } else {
        // Handle empty result
        setScanProgress(0);
        setIsAutoProcessing(false);
        setStatusMessage('Failed to process receipt');
      }
    } catch (error) {
      console.error('Error auto-processing receipt:', error);
      setIsAutoProcessing(false);
      setStatusMessage('Error processing receipt');
    }
  }, [file, autoSave, onCapture, setOpen, processScan]);
  
  // Reset scan state
  const resetScanState = useCallback(() => {
    setIsScanning(false);
    setIsAutoProcessing(false);
    setScanProgress(0);
    setScanTimedOut(false);
    setScanError(null);
    setStatusMessage('');
  }, []);
  
  return {
    isScanning,
    isAutoProcessing,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    autoProcessReceipt,
    resetScanState
  };
}
