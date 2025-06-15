import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileImage, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToSupabase } from '@/utils/receipt/uploadService';
import { useAuth } from '@/lib/auth';
import { Progress } from '@/components/ui/progress';

interface BulkReceiptUploadProps {
  onUploadComplete: () => void;
  onClose: () => void;
}

interface UploadItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  preview?: string;
  error?: string;
  receiptUrl?: string;
  progress?: number;
}

export function BulkReceiptUpload({ onUploadComplete, onClose }: BulkReceiptUploadProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });

    const newItems: UploadItem[] = validFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: 'pending',
      preview: URL.createObjectURL(file),
      progress: 0
    }));

    setUploadItems(prev => [...prev, ...newItems]);
    
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeItem = (id: string) => {
    setUploadItems(prev => {
      const item = prev.find(item => item.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const processAllReceipts = async () => {
    if (!user) {
      toast.error('You must be logged in to upload receipts');
      return;
    }

    setIsProcessing(true);
    let completedCount = 0;
    let errorCount = 0;

    // Process receipts with better progress tracking
    for (let i = 0; i < uploadItems.length; i++) {
      const item = uploadItems[i];
      
      if (item.status === 'completed') {
        completedCount++;
        continue;
      }

      // Update status to uploading
      setUploadItems(prev => 
        prev.map(uploadItem => 
          uploadItem.id === item.id 
            ? { ...uploadItem, status: 'uploading', progress: 10 } 
            : uploadItem
        )
      );

      try {
        console.log(`Processing receipt ${i + 1}/${uploadItems.length}: ${item.file.name}`);
        
        // Update progress
        setUploadItems(prev => 
          prev.map(uploadItem => 
            uploadItem.id === item.id 
              ? { ...uploadItem, progress: 50 } 
              : uploadItem
          )
        );
        
        // Upload the file to Supabase storage
        const receiptUrl = await uploadToSupabase(item.file, user.id);

        if (receiptUrl) {
          console.log(`Successfully uploaded: ${item.file.name} -> ${receiptUrl}`);
          
          setUploadItems(prev => 
            prev.map(uploadItem => 
              uploadItem.id === item.id 
                ? { 
                    ...uploadItem, 
                    status: 'completed',
                    receiptUrl,
                    progress: 100 
                  } 
                : uploadItem
            )
          );
          completedCount++;
        } else {
          throw new Error('Failed to upload to storage');
        }
      } catch (error) {
        console.error(`Error processing receipt ${item.file.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploadItems(prev => 
          prev.map(uploadItem => 
            uploadItem.id === item.id 
              ? { 
                  ...uploadItem, 
                  status: 'error', 
                  error: errorMessage,
                  progress: 0
                } 
              : uploadItem
          )
        );
        errorCount++;
      }

      // Small delay between uploads to prevent rate limiting
      if (i < uploadItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsProcessing(false);
    
    if (completedCount > 0) {
      toast.success(`Successfully uploaded ${completedCount} receipt${completedCount > 1 ? 's' : ''}`);
      
      // Dispatch event to refresh expenses
      const event = new CustomEvent('expenses-updated', { 
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(event);
      
      onUploadComplete();
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to upload ${errorCount} receipt${errorCount > 1 ? 's' : ''}`);
    }
  };

  const getProgress = () => {
    if (uploadItems.length === 0) return 0;
    
    const totalProgress = uploadItems.reduce((sum, item) => {
      switch (item.status) {
        case 'completed': return sum + 100;
        case 'uploading': return sum + (item.progress || 0);
        case 'error': return sum + 0;
        default: return sum + 0;
      }
    }, 0);
    
    return totalProgress / uploadItems.length;
  };

  const getStatusColor = (status: UploadItem['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'uploading': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (item: UploadItem) => {
    switch (item.status) {
      case 'uploading': 
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed': 
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': 
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: 
        return <div className="h-2 w-2 bg-gray-300 rounded-full" />;
    }
  };

  const hasErrors = uploadItems.some(item => item.status === 'error');
  const hasCompleted = uploadItems.some(item => item.status === 'completed');
  const allCompleted = uploadItems.length > 0 && uploadItems.every(item => item.status === 'completed');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bulk Receipt Upload</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-2">Drop receipt images here or click to browse</p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports multiple images: JPG, PNG, HEIC (Max 5MB each)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            Select Images
          </Button>
        </div>

        {/* Progress Bar */}
        {uploadItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        )}

        {/* File List */}
        {uploadItems.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
                {item.preview && (
                  <img 
                    src={item.preview} 
                    alt="Receipt preview"
                    className="h-10 w-10 object-cover rounded"
                  />
                )}
                <FileImage className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {item.error && (
                    <p className="text-xs text-red-600">{item.error}</p>
                  )}
                  {item.status === 'uploading' && item.progress !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item)}
                  <span className="text-xs capitalize">{item.status}</span>
                </div>
                {!isProcessing && item.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {uploadItems.length > 0 && (
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={processAllReceipts}
              disabled={isProcessing || allCompleted}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : allCompleted ? (
                'All Uploaded'
              ) : (
                'Upload All Receipts'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                uploadItems.forEach(item => {
                  if (item.preview) URL.revokeObjectURL(item.preview);
                });
                setUploadItems([]);
              }}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Status Summary */}
        {(hasCompleted || hasErrors) && (
          <div className="text-xs text-muted-foreground">
            {hasCompleted && (
              <p className="text-green-600">
                ✓ {uploadItems.filter(item => item.status === 'completed').length} uploaded successfully
              </p>
            )}
            {hasErrors && (
              <p className="text-red-600">
                ✗ {uploadItems.filter(item => item.status === 'error').length} failed to upload
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
