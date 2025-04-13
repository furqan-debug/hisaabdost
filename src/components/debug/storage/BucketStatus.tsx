
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { checkReceiptsBucketExists, createReceiptsBucket } from "@/utils/supabase/storage";

interface BucketStatusProps {
  loading: boolean;
  bucketStatus: boolean | null;
  setBucketStatus: (status: boolean) => void;
}

export function BucketStatus({ loading, bucketStatus, setBucketStatus }: BucketStatusProps) {
  const checkBucketStatus = async () => {
    const result = await checkReceiptsBucketExists();
    setBucketStatus(result);
  };

  const handleCreateBucket = async () => {
    const created = await createReceiptsBucket();
    if (created) {
      setBucketStatus(true);
    }
  };

  return (
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
  );
}
