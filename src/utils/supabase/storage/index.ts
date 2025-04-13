
/**
 * Index file that re-exports all storage-related functionality
 */
export * from './bucketOperations';
export * from './fileOperations';
export * from './listOperations';
export * from './deleteOperations';

// Re-export the bucket name for consistency
export const bucketName = 'receipts';
