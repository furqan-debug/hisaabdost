
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkFileExists, getFileUrl } from "@/utils/supabase/storage";

interface FileOperationsProps {
  loading: boolean;
  filePath: string;
  setFilePath: (path: string) => void;
}

export function FileOperations({ loading, filePath, setFilePath }: FileOperationsProps) {
  const [fileExists, setFileExists] = useState<boolean | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const handleCheckFile = async () => {
    if (!filePath) return;
    
    const exists = await checkFileExists(filePath);
    setFileExists(exists);
    
    if (exists) {
      const url = await getFileUrl(filePath);
      setPublicUrl(url);
    } else {
      setPublicUrl(null);
    }
  };

  return (
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
  );
}
