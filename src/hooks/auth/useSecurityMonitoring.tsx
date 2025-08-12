
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityMonitoring = () => {
  const { user, session } = useAuth();

  const logSecurityEvent = async (eventType: string, details: Record<string, any> = {}) => {
    try {
      // Only log if we have a valid session
      if (!session) return;

      await supabase.functions.invoke('log-security-event', {
        body: {
          event_type: eventType,
          user_id: user?.id,
          details,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Silently fail - don't break user experience for logging issues
      console.debug('Security logging failed:', error);
    }
  };

  const checkUnusualAccess = async () => {
    try {
      if (!user?.id) return false;

      const { data, error } = await supabase.functions.invoke('detect-unusual-access', {
        body: {
          user_id: user.id,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.debug('Unusual access check failed:', error);
        return false;
      }

      return data?.unusual || false;
    } catch (error) {
      console.debug('Unusual access check error:', error);
      return false;
    }
  };

  // Log successful login when user becomes available
  useEffect(() => {
    if (user && session) {
      logSecurityEvent('successful_login', {
        user_agent: navigator.userAgent,
        login_method: 'email_password'
      });
    }
  }, [user, session]);

  // Monitor for page visibility changes (potential session hijacking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        logSecurityEvent('session_resumed', {
          visibility_state: 'visible'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  return {
    logSecurityEvent,
    checkUnusualAccess
  };
};
