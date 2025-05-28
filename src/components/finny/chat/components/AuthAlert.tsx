
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AuthAlertProps {
  user: any;
  isAuthPromptOnly: boolean;
}

export const AuthAlert = ({ user, isAuthPromptOnly }: AuthAlertProps) => {
  if (user || isAuthPromptOnly) return null;

  return (
    <Alert variant="default" className="mb-4 bg-muted/50 border-primary/20 rounded-lg">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm">
        You need to log in to use Finny's personalized features.
      </AlertDescription>
    </Alert>
  );
};
