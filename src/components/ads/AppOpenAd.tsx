import React, { useEffect } from 'react';
import { useAppOpenAds } from '@/hooks/useAppOpenAds';

interface AppOpenAdProps {
  adUnitId: string;
  testingDevices?: string[];
  showFrequencyHours?: number;
  enabled?: boolean;
}

export const AppOpenAd: React.FC<AppOpenAdProps> = ({
  adUnitId,
  testingDevices = [],
  showFrequencyHours = 4,
  enabled = true
}) => {
  const { getAdStatus, showAd, loadAd } = useAppOpenAds({
    adUnitId,
    testingDevices,
    showFrequencyHours,
    enabled
  });

  useEffect(() => {
    // This component doesn't render anything visible
    // It just manages the app open ad lifecycle
    console.log('📱 AppOpenAd component mounted with config:', {
      adUnitId,
      showFrequencyHours,
      enabled
    });
  }, [adUnitId, showFrequencyHours, enabled]);

  // This component doesn't render anything visual
  // The ads are shown automatically based on app lifecycle events
  return null;
};

export default AppOpenAd;