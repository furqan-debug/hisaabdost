
import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeepLinkData {
  token?: string;
  email?: string;
}

export const useDeepLinkHandler = () => {
  const [deepLinkData, setDeepLinkData] = useState<DeepLinkData>({});
  const [isFromDeepLink, setIsFromDeepLink] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let listenerHandle: PluginListenerHandle | null = null;

    // Handle app opened via deep link
    const setupListener = async () => {
      listenerHandle = await App.addListener('appUrlOpen', async (event) => {
        console.log('🔗 App opened via deep link:', event.url);
        
        // Handle password reset
        if (event.url.includes('reset-password')) {
          const url = new URL(event.url);
          const token = url.searchParams.get('token');
          const email = url.searchParams.get('email');
          
          if (token && email) {
            setDeepLinkData({ token, email });
            setIsFromDeepLink(true);
            navigate('/auth?reset=true');
          }
        }
        
      });
    };

    setupListener();

    // Check if app was opened with a URL initially
    App.getLaunchUrl().then(async result => {
      if (result?.url) {
        console.log('🔗 App launched with deep link:', result.url);
        
        // Handle password reset
        if (result.url.includes('reset-password')) {
          const url = new URL(result.url);
          const token = url.searchParams.get('token');
          const email = url.searchParams.get('email');
          
          if (token && email) {
            setDeepLinkData({ token, email });
            setIsFromDeepLink(true);
            navigate('/auth?reset=true');
          }
        }
        
      }
    }).catch(error => {
      console.log('🔗 Error getting launch URL:', error);
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
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
