
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { 
  listUserReceipts, 
  checkFileExists, 
  getFileUrl, 
  checkReceiptsBucketExists, 
  createReceiptsBucket,
  deleteAllFiles,
  listAllFiles,
  bucketName
} from "@/utils/supabase/storage";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function SupabaseStorageDebugger() {
  const { user } = useAuth();
  const [filePath, setFilePath] = useState("");
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<boolean | null>(null);
  const [allFilesCount, setAllFilesCount] = useState<number | null>(null);
  const [deletionStats, setDeletionStats] = useState<{deleted: number, failed: number} | null>(null);

  useEffect(() => {
    if (user) {
      // Default the file path to the user's folder
      setFilePath(`${user.id}/`);
      // Check bucket status on load
      checkBucketStatus();
    }
  }, [user]);

  const checkBucketStatus = async () => {
    const result = await checkReceiptsBucketExists();
    setBucketStatus(result);
  };

  const handleCheckFile = async () => {
    if (!filePath) return;
    
    setLoading(true);
    const exists = await checkFileExists(filePath);
    setFileExists(exists);
    
    if (exists) {
      const url = await getFileUrl(filePath);
      setPublicUrl(url);
    } else {
      setPublicUrl(null);
    }
    
    setLoading(false);
  };

  const handleListUserFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    const files = await listUserReceipts(user.id);
    setUserFiles(files);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTestFile(e.target.files[0]);
    }
  };

  const handleUploadTest = async () => {
    if (!testFile || !user) return;
    
    setLoading(true);
    setUploadResult(null);
    
    try {
      // First check if bucket exists, create if it doesn't
      const bucketExists = await checkReceiptsBucketExists();
      if (!bucketExists) {
        const created = await createReceiptsBucket();
        if (!created) {
          setUploadResult("Error: Failed to create receipts bucket");
          setLoading(false);
          return;
        }
      }
      
      // Generate a unique filename
      const fileName = `test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const fileExt = testFile.name.split('.').pop() || 'jpg';
      const fullPath = `${user.id}/${fileName}.${fileExt}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fullPath, testFile, {
          upsert: true,
          contentType: testFile.type
        });
      
      if (error) {
        setUploadResult(`Error: ${error.message}`);
      } else {
        const url = await getFileUrl(fullPath);
        setUploadResult(`Success! File uploaded to: ${fullPath}\nPublic URL: ${url}`);
        
        // Refresh file list
        handleListUserFiles();
      }
    } catch (error: any) {
      setUploadResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async () => {
    setLoading(true);
    const created = await createReceiptsBucket();
    if (created) {
      setBucketStatus(true);
    }
    setLoading(false);
  };

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
      
      // Refresh file lists
      setAllFilesCount(0);
      if (user) {
        setUserFiles([]);
      }
    } catch (error) {
      toast.error("Error permanently deleting files");
      console.error("Error deleting files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Supabase Storage Debugger</CardTitle>
        <CardDescription>
          Test and debug Supabase storage functionality for receipt uploads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-md bg-muted">
          <h3 className="text-sm font-medium mb-2">Storage Bucket Status</h3>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              bucketStatus === null ? 'bg-gray-400' : 
              bucketStatus ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm">
              {bucketStatus === null ? 'Unknown' : 
               bucketStatus ? 'Receipts bucket exists' : 'Receipts bucket missing'}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkBucketStatus} 
                disabled={loading}
              >
                Check
              </Button>
              {!bucketStatus && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCreateBucket}
                  disabled={loading}
                >
                  Create Bucket
                </Button>
              )}
            </div>
          </div>
        </div>

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

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Check File Exists</h3>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="filePath">File Path</Label>
              <Input 
                id="filePath" 
                value={filePath} 
                onChange={(e) => setFilePath(e.target.value)} 
                placeholder="user-id/filename.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter the full path of the file to check
              </p>
            </div>
            
            <Button 
              onClick={handleCheckFile} 
              disabled={!filePath || loading}
            >
              Check File
            </Button>
            
            {fileExists !== null && (
              <div className="p-4 rounded-md bg-muted">
                <p>
                  File {fileExists ? 'exists' : 'does not exist'}
                </p>
                {publicUrl && (
                  <div className="mt-2">
                    <p className="text-sm mb-2">Public URL:</p>
                    <a 
                      href={publicUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 break-all"
                    >
                      {publicUrl}
                    </a>
                    <div className="mt-2">
                      <img 
                        src={publicUrl} 
                        alt="File preview" 
                        className="max-h-32 rounded-md border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          console.error("Failed to load image:", publicUrl);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">List User Files</h3>
          <Button 
            onClick={handleListUserFiles} 
            disabled={!user || loading}
          >
            List My Files
          </Button>
          
          {userFiles.length > 0 && (
            <div className="mt-4 p-4 rounded-md bg-muted max-h-64 overflow-y-auto">
              <p className="text-sm mb-2">Found {userFiles.length} files:</p>
              <ul className="space-y-2">
                {userFiles.map((file, index) => (
                  <li key={index} className="text-xs">
                    {file.name} ({Math.round(file.metadata.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {userFiles.length === 0 && userFiles.length !== null && (
            <p className="mt-2 text-sm text-muted-foreground">No files found</p>
          )}
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Test Upload</h3>
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="testFile">Test File</Label>
              <Input 
                id="testFile" 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*"
              />
            </div>
            
            <Button 
              onClick={handleUploadTest} 
              disabled={!testFile || !user || loading}
            >
              Upload Test File
            </Button>
            
            {uploadResult && (
              <div className="p-4 rounded-md bg-muted">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {uploadResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        {user ? (
          <>Your user ID: {user.id}</>
        ) : (
          <>Please log in to test storage functionality</>
        )}
      </CardFooter>
    </Card>
  );
}
