
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { listAllFiles, deleteAllFiles } from "@/utils/supabase/storage";
import { toast } from "sonner";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface StorageAdminProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function StorageAdmin({ loading, setLoading }: StorageAdminProps) {
  const [allFilesCount, setAllFilesCount] = useState<number | null>(null);
  const [deletionStats, setDeletionStats] = useState<{deleted: number, failed: number} | null>(null);

  const handleCountAllFiles = async () => {
    setLoading(true);
    const files = await listAllFiles();
    setAllFilesCount(files.length);
    setLoading(false);
  };

  const handleDeleteAllFiles = async () => {
    setLoading(true);
    setDeletionStats(null);
    
    try {
      const result = await deleteAllFiles();
      setDeletionStats(result);
      toast.success(`Permanently deleted ${result.deleted} files`);
      
      if (result.failed > 0) {
        toast.error(`Failed to delete ${result.failed} files`);
      }
      
      // Reset counts
      setAllFilesCount(0);
    } catch (error) {
      toast.error("Error permanently deleting files");
      console.error("Error deleting files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-medium mb-4">Storage Administration</h3>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCountAllFiles} 
            disabled={loading}
          >
            Count All Files
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
              >
                Permanently Delete All Files
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete All Files</AlertDialogTitle>
                <AlertDialogDescription>
                  This will <strong>permanently delete</strong> all files in all folders of the receipts bucket.
                  This action cannot be undone. Are you absolutely sure?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllFiles}>
                  Yes, Permanently Delete All Files
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {allFilesCount !== null && (
          <div className="p-2 text-sm bg-muted rounded">
            {allFilesCount} total files found in storage
          </div>
        )}
        
        {deletionStats && (
          <div className={`p-2 text-sm rounded ${
            deletionStats.failed > 0 ? 'bg-amber-100 dark:bg-amber-950' : 'bg-green-100 dark:bg-green-950'
          }`}>
            {deletionStats.deleted} files permanently deleted.
            {deletionStats.failed > 0 && ` ${deletionStats.failed} files failed to delete.`}
          </div>
        )}
      </div>
    </div>
  );
}
