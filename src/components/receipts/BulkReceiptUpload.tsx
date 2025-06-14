
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { processReceiptFile } from '@/utils/receipt/receiptProcessor';
import { useAuth } from '@/lib/auth';
import { Progress } from '@/components/ui/progress';

interface BulkReceiptUploadProps {
  onUploadComplete: () => void;
  onClose: () => void;
}

interface UploadItem {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  preview?: string;
  error?: string;
}

export function BulkReceiptUpload({ onUploadComplete, onClose }: BulkReceiptUploadProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newItems: UploadItem[] = files.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: 'pending',
      preview: URL.createObjectURL(file)
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

    // Process receipts sequentially to avoid overwhelming the system
    for (const item of uploadItems) {
      if (item.status === 'completed') continue;

      setUploadItems(prev => 
        prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i)
      );

      try {
        const result = await processReceiptFile(
          item.file,
          user.id,
          () => {}, // Empty update function since we're handling state here
          () => {} // Empty loading function
        );

        if (result) {
          setUploadItems(prev => 
            prev.map(i => i.id === item.id ? { ...i, status: 'completed' } : i)
          );
          completedCount++;
        } else {
          throw new Error('Failed to process receipt');
        }
      } catch (error) {
        console.error('Error processing receipt:', error);
        setUploadItems(prev => 
          prev.map(i => i.id === item.id ? { 
            ...i, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          } : i)
        );
        errorCount++;
      }

      // Small delay between uploads to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
    
    if (completedCount > 0) {
      toast.success(`Successfully processed ${completedCount} receipt${completedCount > 1 ? 's' : ''}`);
      onUploadComplete();
    }
    
    if (errorCount > 0) {
      toast.error(`Failed to process ${errorCount} receipt${errorCount > 1 ? 's' : ''}`);
    }
  };

  const getProgress = () => {
    const total = uploadItems.length;
    const completed = uploadItems.filter(item => 
      item.status === 'completed' || item.status === 'error'
    ).length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getStatusColor = (status: UploadItem['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: UploadItem['status']) => {
    switch (status) {
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed': return <div className="h-2 w-2 bg-green-500 rounded-full" />;
      case 'error': return <div className="h-2 w-2 bg-red-500 rounded-full" />;
      default: return <div className="h-2 w-2 bg-gray-300 rounded-full" />;
    }
  };

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
            Supports multiple images: JPG, PNG, HEIC
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
              <span>Progress</span>
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
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
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
              disabled={isProcessing || uploadItems.every(item => item.status === 'completed')}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process All Receipts'
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
      </CardContent>
    </Card>
  );
}
