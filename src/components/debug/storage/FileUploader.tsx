
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { checkReceiptsBucketExists, createReceiptsBucket, getFileUrl } from "@/utils/supabase/storage";

interface FileUploaderProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  user: User | null;
  onUploadComplete: () => void;
}

export function FileUploader({ loading, setLoading, user, onUploadComplete }: FileUploaderProps) {
  const [testFile, setTestFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

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
        
        // Notify parent to refresh file list
        onUploadComplete();
      }
    } catch (error: any) {
      setUploadResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
