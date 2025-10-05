import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QualityAnalysis } from "@/utils/receipt/qualityDetection";

interface QualityWarningProps {
  analysis: QualityAnalysis;
  onProceed: () => void;
  onRetake?: () => void;
}

export function QualityWarning({ analysis, onProceed, onRetake }: QualityWarningProps) {
  const highSeverityIssues = analysis.issues.filter(i => i.severity === 'high');
  const hasHighSeverityIssues = highSeverityIssues.length > 0;
  
  if (analysis.isAcceptable && analysis.issues.length === 0) {
    return (
      <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-sm text-green-800 dark:text-green-200">
          Image quality looks good! (Score: {analysis.score}/100)
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-3">
      <Alert className={hasHighSeverityIssues ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" : "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"}>
        {hasHighSeverityIssues ? (
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        ) : (
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        )}
        <AlertDescription className="space-y-2">
          <div className={`text-sm font-medium ${hasHighSeverityIssues ? "text-red-800 dark:text-red-200" : "text-yellow-800 dark:text-yellow-200"}`}>
            {hasHighSeverityIssues ? "Image quality is poor" : "Image quality could be better"} (Score: {analysis.score}/100)
          </div>
          
          <div className="space-y-2 text-xs">
            {analysis.issues.map((issue, idx) => (
              <div key={idx} className={hasHighSeverityIssues ? "text-red-700 dark:text-red-300" : "text-yellow-700 dark:text-yellow-300"}>
                <div className="font-medium">• {issue.message}</div>
                <div className="ml-3 text-muted-foreground">{issue.suggestion}</div>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2">
        {onRetake && (
          <button
            onClick={onRetake}
            className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retake Photo
          </button>
        )}
        <button
          onClick={onProceed}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
            hasHighSeverityIssues
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {hasHighSeverityIssues ? "Try Anyway" : "Continue"}
        </button>
      </div>
    </div>
  );
}
