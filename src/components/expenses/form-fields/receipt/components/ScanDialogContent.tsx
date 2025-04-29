
import { Receipt, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScanButton } from "./ScanButton";
import { useProgressAnimation } from "../hooks/useProgressAnimation";
import { getProgressStyles } from "../utils/progressColors";

interface ScanDialogContentProps {
  previewUrl: string | null;
  isScanning: boolean;
  isAutoProcessing: boolean;
  scanProgress: number;
  statusMessage: string;
  scanTimedOut: boolean;
  scanError: boolean;
  handleScanReceipt: () => void;
  onCleanup: () => void;
  fileExists: boolean;
  processingComplete: boolean;
  autoProcess?: boolean;
}

export function ScanDialogContent({
  previewUrl,
  isScanning,
  isAutoProcessing,
  scanProgress,
  statusMessage,
  scanTimedOut,
  scanError,
  handleScanReceipt,
  onCleanup,
  fileExists,
  processingComplete,
  autoProcess = true
}: ScanDialogContentProps) {
  // Use the improved progress animation hook
  const displayedProgress = useProgressAnimation({ 
    isScanning: isScanning || isAutoProcessing, 
    backendProgress: scanProgress 
  });

  // Get gradient styles for smooth color transitions
  const progressStyles = getProgressStyles(displayedProgress);

  // Format progress to whole number for display
  const formattedProgress = Math.round(displayedProgress);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Receipt className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {processingComplete 
            ? "Receipt Processed!" 
            : scanError 
              ? "Processing Error" 
              : scanTimedOut 
                ? "Processing Timed Out"
                : "Processing Receipt..."}
        </h2>
      </div>
      
      {previewUrl && (
        <div className="relative mt-2 bg-card/30 rounded-lg p-2 border border-border">
          <img 
            src={previewUrl} 
            className="mx-auto w-full h-auto max-h-[300px] rounded object-contain" 
            alt="Receipt preview" 
          />
          
          {/* Progress overlay */}
          {(isScanning || isAutoProcessing) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg text-white">
              <p className="mb-4 text-center px-4">{statusMessage || "Processing receipt image..."}</p>
              
              <div className="w-4/5 px-4">
                <Progress 
                  value={displayedProgress} 
                  className="h-2.5 bg-secondary/30"
                  indicatorClassName={`bg-gradient-to-r ${progressStyles.className} animate-gradient`}
                  indicatorStyle={{ background: progressStyles.background }}
                />
                <div className="flex justify-between text-xs mt-2">
                  <span>0%</span>
                  <span className="font-medium">{formattedProgress}% complete</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {scanError && !isScanning && !isAutoProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg text-white">
              <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
              <p className="text-center px-4">Error processing receipt</p>
            </div>
          )}
          
          {/* Success overlay */}
          {processingComplete && !isScanning && !isAutoProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg text-white">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-center px-4">Receipt processed successfully!</p>
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        {!processingComplete && (
          <>
            {(scanError || scanTimedOut) && !isScanning && !isAutoProcessing && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {scanTimedOut ? (
                  <p>Processing is taking longer than expected. Please try again.</p>
                ) : (
                  <p>There was an error processing your receipt. Please try again.</p>
                )}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCleanup}
                className="flex-1"
                disabled={isScanning || isAutoProcessing}
              >
                Cancel
              </Button>
              
              <ScanButton
                isScanning={isScanning}
                scanTimedOut={scanTimedOut}
                onClick={handleScanReceipt}
                disabled={!fileExists || isScanning || isAutoProcessing}
                autoSave={true}
                isAutoProcessing={isAutoProcessing}
                scanProgress={displayedProgress}
                statusMessage={statusMessage}
              />
            </div>
          </>
        )}
        
        {processingComplete && !isScanning && !isAutoProcessing && (
          <Button
            type="button"
            variant="default"
            onClick={onCleanup}
            className="w-full"
          >
            Close <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
