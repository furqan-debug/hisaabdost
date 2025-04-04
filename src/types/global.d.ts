
export {};

declare global {
  interface Window {
    onReceiptProcessSuccess?: (itemCount: number) => void;
  }
  
  interface WindowEventMap {
    'receipt-scanned': CustomEvent<{ timestamp: number, count: number }>;
    'expenses-updated': CustomEvent<{ timestamp: number, count: number }>;
    'receipt-scan-completed': CustomEvent<{ timestamp: number, items: number, success: boolean }>;
    'force-query-invalidation': CustomEvent<{ queryKeys: string[] }>;
  }
}
