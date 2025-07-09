
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NativeAd } from '@/components/ads/NativeAd';

export const AdMobDemo: React.FC = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Native Ad Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted rounded-lg text-xs">
          <p className="font-medium mb-1">Native Ad:</p>
          <p className="text-muted-foreground">This shows how native ads integrate seamlessly into the app content.</p>
        </div>
        
        <NativeAd adId="ca-app-pub-8996865130200922/3082510590" />
        
        <div className="p-3 bg-muted rounded-lg text-xs">
          <p className="font-medium mb-1">Usage Instructions:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Native ads blend with app content</li>
            <li>• Replace with your real ad unit IDs in production</li>
            <li>• Works on native mobile platforms</li>
            <li>• Provides better user experience than banner ads</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
