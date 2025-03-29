
import { useState } from 'react';
import { useScanState } from './useScanState';
import { useReceiptScanning } from './useReceiptScanning';
import { useAutoScanning } from './useAutoScanning';
import { toast } from 'sonner';

export interface UseScanReceiptProps {
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
  onSuccess?: () => void;
  processAllItems?: boolean;
}

export function useScanReceipt({
  file,
  onCleanup,
  onCapture,
  autoSave = true,
  setOpen,
  onSuccess,
  processAllItems = true
}: UseScanReceiptProps) {
  // Get the scanning state and functionality
  const {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    processingComplete,
    resetScanState
  } = useReceiptScanning({
    file,
    onCleanup,
    onCapture,
    setOpen,
    onSuccess
  });
  
  // Add auto-processing functionality
  const {
    isAutoProcessing,
    autoProcessReceipt
  } = useAutoScanning({
    file,
    handleScanReceipt
  });

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    isAutoProcessing,
    processingComplete,
    autoProcessReceipt,
    resetScanState
  };
}
