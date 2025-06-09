
import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';

interface DeepLinkData {
  token?: string;
  email?: string;
}

export const useDeepLinkHandler = () => {
  const [deepLinkData, setDeepLinkData] = useState<DeepLinkData>({});
  const [isFromDeepLink, setIsFromDeepLink] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle app opened via deep link
    const handleAppUrlOpen = App.addListener('appUrlOpen', (event) => {
      console.log('App opened via deep link:', event.url);
      
      if (event.url.includes('reset-password')) {
        const url = new URL(event.url);
        const token = url.searchParams.get('token');
        const email = url.searchParams.get('email');
        
        if (token && email) {
          setDeepLinkData({ token, email });
          setIsFromDeepLink(true);
          
          // Navigate to auth page with reset flow
          navigate('/auth?reset=true');
        }
      }
    });

    // Check if app was opened with a URL initially
    App.getLaunchUrl().then(result => {
      if (result?.url && result.url.includes('reset-password')) {
        console.log('App launched with deep link:', result.url);
        
        const url = new URL(result.url);
        const token = url.searchParams.get('token');
        const email = url.searchParams.get('email');
        
        if (token && email) {
          setDeepLinkData({ token, email });
          setIsFromDeepLink(true);
          
          // Navigate to auth page with reset flow
          navigate('/auth?reset=true');
        }
      }
    }).catch(error => {
      console.log('Error getting launch URL:', error);
    });

    return () => {
      handleAppUrlOpen.remove();
    };
  }, [navigate]);

  const clearDeepLinkData = () => {
    setDeepLinkData({});
    setIsFromDeepLink(false);
  };

  return {
    deepLinkData,
    isFromDeepLink,
    clearDeepLinkData
  };
};
