
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UseScanProcessProps {
  file: File | null;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  setScanProgress: (progress: number) => void;
  setScanTimedOut: (timedOut: boolean) => void;
}

export function useScanProcess({
  file,
  isScanning,
  setIsScanning,
  setScanProgress,
  setScanTimedOut
}: UseScanProcessProps) {
  // Handle receipt scanning
  const handleScanReceipt = useCallback(async () => {
    if (!file || isScanning) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanTimedOut(false);
    
    try {
      // Start progress animation
      const progressInterval = startProgressAnimation(setScanProgress);
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('receipt', file);
      
      // Set a timeout to detect when scanning takes too long
      const timeoutId = setTimeout(() => {
        setScanTimedOut(true);
      }, 20000); // 20 seconds timeout
      
      // Call the Supabase function with the correct method
      const { data, error } = await supabase.functions.invoke('scan-receipt', {
        method: 'POST',
        body: formData,
      });
      
      clearTimeout(timeoutId);
      
      // Stop the progress animation at 99% (will be set to 100% after processing)
      clearInterval(progressInterval);
      setScanProgress(99);
      
      if (error) {
        console.warn("Scan completed with error:", error);
        toast.error("Couldn't read receipt clearly. Please enter details manually.");
      }
      
      // Store the result in session storage for use
      storeResultInSession(data);
      
      // Mark scan as complete
      setTimeout(() => {
        setScanProgress(100);
        setIsScanning(false);
      }, 300);
      
      return data;
    } catch (error) {
      console.error("Error scanning receipt:", error);
      setIsScanning(false);
      toast.error("Failed to scan receipt. Please try again or enter details manually.");
      return null;
    }
  }, [file, isScanning, setIsScanning, setScanProgress, setScanTimedOut]);

  return { handleScanReceipt };
}

// Helper function to animate progress
function startProgressAnimation(setScanProgress: (progress: number) => void) {
  let progress = 0;
  
  // Simulate progress with a non-linear curve that slows down
  const interval = setInterval(() => {
    // Progress formula designed to move quickly at first, then slow down
    if (progress < 30) {
      progress += 1;
    } else if (progress < 60) {
      progress += 0.7;
    } else if (progress < 80) {
      progress += 0.3;
    } else if (progress < 90) {
      progress += 0.1;
    }
    
    // Cap at 95% - the real completion will be set after processing
    if (progress > 95) {
      progress = 95;
      clearInterval(interval);
    }
    
    setScanProgress(progress);
  }, 200);
  
  return interval;
}

// Store scan result in session storage
function storeResultInSession(result: any) {
  try {
    if (result && result.items) {
      sessionStorage.setItem('lastScanResult', JSON.stringify(result));
    }
  } catch (error) {
    console.error("Error storing scan result:", error);
  }
}
