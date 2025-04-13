
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { checkReceiptsBucketExists } from "@/utils/supabase/storage";

export function useStorageDebugger() {
  const { user } = useAuth();
  const [filePath, setFilePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<boolean | null>(null);

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

  return {
    user,
    filePath,
    setFilePath,
    loading,
    setLoading,
    bucketStatus,
    setBucketStatus,
    checkBucketStatus
  };
}
