
import React from 'react';
import { NativeAd } from './NativeAd';

interface TestNativeAdProps {
  className?: string;
}

export const TestNativeAd = ({ className }: TestNativeAdProps) => {
  return (
    <div className={`test-native-ad ${className}`}>
      <NativeAd 
        adId="ca-app-pub-3940256099942544/2247696110" 
        testMode={true}
        className="border-2 border-dashed border-yellow-400"
      />
    </div>
  );
};
