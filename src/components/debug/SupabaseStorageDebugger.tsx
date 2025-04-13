
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useStorageDebugger } from "./storage/useStorageDebugger";
import { BucketStatus } from "./storage/BucketStatus";
import { StorageAdmin } from "./storage/StorageAdmin";
import { FileOperations } from "./storage/FileOperations";
import { UserFilesList } from "./storage/UserFilesList";
import { FileUploader } from "./storage/FileUploader";

export function SupabaseStorageDebugger() {
  const { 
    user, 
    filePath, 
    setFilePath, 
    loading, 
    setLoading, 
    bucketStatus, 
    setBucketStatus 
  } = useStorageDebugger();

  return (
    <Card className="w-full max-w-3xl mx-auto my-4">
      <CardHeader>
        <CardTitle>Supabase Storage Debugger</CardTitle>
        <CardDescription>
          Test and debug Supabase storage functionality for receipt uploads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BucketStatus 
          bucketStatus={bucketStatus} 
          setBucketStatus={setBucketStatus} 
          loading={loading} 
        />

        <StorageAdmin 
          loading={loading} 
          setLoading={setLoading} 
        />

        <FileOperations 
          loading={loading}
          filePath={filePath}
          setFilePath={setFilePath}
        />
        
        <UserFilesList 
          loading={loading}
          setLoading={setLoading}
          user={user}
        />
        
        <FileUploader 
          loading={loading}
          setLoading={setLoading}
          user={user}
          onUploadComplete={() => {
            // This is a placeholder for refreshing the user files list
            // We would typically call handleListUserFiles here
          }}
        />
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
