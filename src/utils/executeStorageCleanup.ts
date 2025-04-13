
import { deleteAllFiles } from "./testSupabaseStorage";

/**
 * Execute immediate cleanup of all files in Supabase storage
 */
export async function executeStorageCleanup() {
  console.log("Starting immediate storage cleanup...");
  try {
    const result = await deleteAllFiles();
    console.log(`Storage cleanup complete. Permanently deleted ${result.deleted} files. Failed: ${result.failed}`);
    return result;
  } catch (error) {
    console.error("Storage cleanup failed:", error);
    return { deleted: 0, failed: 0, error: error.message };
  }
}

// Run the cleanup immediately when this file is imported
executeStorageCleanup();
