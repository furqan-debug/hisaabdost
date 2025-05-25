
// Re-export everything from the new modular structure
export { 
  generateFileFingerprint,
  uploadToSupabase 
} from './receipt/uploadService';

export {
  processReceiptFile,
  handleReceiptFileChange
} from './receipt/receiptProcessor';

export {
  canProcessFile,
  markFileInProgress,
  markFileComplete,
  getCachedResult
} from './receipt/processingCache';
