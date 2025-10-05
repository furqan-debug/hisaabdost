
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
        
        // Handle OAuth callback (Google sign-in)
        if (event.url.includes('login-callback') || event.url.includes('#access_token')) {
          console.log('🔗 OAuth callback detected');
          
          try {
            // Extract the URL fragment
            const url = new URL(event.url.replace('com.hisaabdost.app://', 'https://dummy.com/'));
            const fragment = url.hash;
            
            if (fragment) {
              // Parse fragment to get tokens
              const params = new URLSearchParams(fragment.substring(1));
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                console.log('🔗 Setting session from OAuth callback');
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (error) {
                  console.error('🔗 Error setting session:', error);
                  toast.error('Failed to complete sign in');
                } else {
                  console.log('🔗 Session set successfully');
                  toast.success('Successfully signed in with Google!');
                  navigate('/app/dashboard');
                }
              }
            }
          } catch (error) {
            console.error('🔗 Error handling OAuth callback:', error);
            toast.error('Failed to complete sign in');
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
        
        // Handle OAuth callback
        if (result.url.includes('login-callback') || result.url.includes('#access_token')) {
          console.log('🔗 OAuth callback detected on launch');
          
          try {
            const url = new URL(result.url.replace('com.hisaabdost.app://', 'https://dummy.com/'));
            const fragment = url.hash;
            
            if (fragment) {
              const params = new URLSearchParams(fragment.substring(1));
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                console.log('🔗 Setting session from OAuth callback on launch');
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (error) {
                  console.error('🔗 Error setting session:', error);
                  toast.error('Failed to complete sign in');
                } else {
                  console.log('🔗 Session set successfully');
                  toast.success('Successfully signed in with Google!');
                  navigate('/app/dashboard');
                }
              }
            }
          } catch (error) {
            console.error('🔗 Error handling OAuth callback:', error);
            toast.error('Failed to complete sign in');
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
