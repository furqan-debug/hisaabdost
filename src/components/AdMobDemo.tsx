
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdMob } from '@/hooks/useAdMob';

export const AdMobDemo: React.FC = () => {
  const {
    showBanner,
    hideBanner,
    removeBanner,
    isLoading,
    isVisible,
    error
  } = useAdMob({
    position: 'BOTTOM_CENTER',
    size: 'BANNER',
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>AdMob Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button 
            onClick={showBanner} 
            disabled={isLoading || isVisible}
            className="w-full"
          >
            {isLoading ? 'Loading...' : 'Show Banner Ad'}
          </Button>
          
          <Button 
            onClick={hideBanner} 
            disabled={isLoading || !isVisible}
            variant="outline"
            className="w-full"
          >
            Hide Banner Ad
          </Button>
          
          <Button 
            onClick={removeBanner} 
            disabled={isLoading || !isVisible}
            variant="destructive"
            className="w-full"
          >
            Remove Banner Ad
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Status: {isVisible ? 'Visible' : 'Hidden'}</p>
          {error && (
            <p className="text-red-500 mt-2">Error: {error}</p>
          )}
        </div>

        <div className="p-3 bg-muted rounded-lg text-xs">
          <p className="font-medium mb-1">Usage Instructions:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• This demo uses test ad IDs</li>
            <li>• Replace with your real ad unit IDs in production</li>
            <li>• Banner ads appear at the bottom of the screen</li>
            <li>• Only works on native mobile platforms</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
