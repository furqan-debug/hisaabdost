
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { listUserReceipts } from "@/utils/supabase/storage";
import { User } from "@supabase/supabase-js";

interface UserFilesListProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  user: User | null;
}

export function UserFilesList({ loading, setLoading, user }: UserFilesListProps) {
  const [userFiles, setUserFiles] = useState<any[]>([]);

  const handleListUserFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    const files = await listUserReceipts(user.id);
    setUserFiles(files);
    setLoading(false);
  };

  return (
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
  );
}
