import { useState, useEffect } from 'react';
import { countryCodeMap, countries } from '@/data/countries';

interface GeolocationState {
  country: string | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
}

interface LocationResult {
  country: string;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    country: null,
    loading: false,
    error: null,
    permission: null,
  });

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  // Get IP-based location as fallback
  const getLocationByIP = async (): Promise<string | null> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code || null;
    } catch (error) {
      console.error('IP geolocation failed:', error);
      return null;
    }
  };

  // Get location using browser geolocation API
  const getBrowserLocation = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!isSupported) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use reverse geocoding to get country from coordinates
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            resolve(data.countryCode || null);
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            resolve(null);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setState(prev => ({
            ...prev,
            permission: error.code === 1 ? 'denied' : prev.permission,
            error: error.message,
          }));
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  };

  // Detect location function
  const detectLocation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // First try browser geolocation
      let countryCode = await getBrowserLocation();
      
      // If browser geolocation fails, try IP-based
      if (!countryCode) {
        countryCode = await getLocationByIP();
      }

      if (countryCode && countryCodeMap[countryCode]) {
        setState(prev => ({
          ...prev,
          country: countryCode,
          loading: false,
          permission: 'granted',
        }));
        return countryCodeMap[countryCode];
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Could not detect your location',
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Location detection failed',
      }));
      return null;
    }
  };

  // Check permission status on mount
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState(prev => ({ ...prev, permission: result.state as any }));
        
        result.addEventListener('change', () => {
          setState(prev => ({ ...prev, permission: result.state as any }));
        });
      });
    }
  }, []);

  return {
    ...state,
    isSupported,
    detectLocation,
  };
};