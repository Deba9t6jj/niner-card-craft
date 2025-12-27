import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { supabase } from '@/integrations/supabase/client';

interface MiniAppUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface MiniAppContextType {
  isReady: boolean;
  isMiniApp: boolean;
  user: MiniAppUser | null;
  isLoading: boolean;
  error: string | null;
  // SDK Actions
  openUrl: (url: string) => Promise<void>;
  close: () => Promise<void>;
  // Farcaster data (fetched from backend)
  farcasterData: {
    user: any;
    activity: any;
    ninerScore: number;
  } | null;
  fetchFarcasterData: () => Promise<void>;
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined);

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [user, setUser] = useState<MiniAppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farcasterData, setFarcasterData] = useState<MiniAppContextType['farcasterData']>(null);

  // Initialize SDK and detect context
  useEffect(() => {
    const initialize = async () => {
      try {
        // Signal to Base/Farcaster that the app is ready
        await sdk.actions.ready();
        setIsReady(true);
        console.log('✅ Base Mini App SDK ready!');

        // Get context (user info, etc.)
        const context = await sdk.context;
        if (context) {
          setIsMiniApp(true);
          console.log('📱 Running inside Base Mini App');
          
          // Extract user from context
          if (context.user) {
            setUser({
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
            });
            console.log('👤 User FID:', context.user.fid);
          }
        }
      } catch (err) {
        console.log('ℹ️ Running outside Mini App context (web browser)');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Fetch full Farcaster data when user is available
  const fetchFarcasterData = useCallback(async () => {
    if (!user?.fid) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke('farcaster-auth', {
        body: { action: 'get_user_stats', fid: user.fid },
      });

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch Farcaster data');
      }

      setFarcasterData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
      console.error('Error fetching Farcaster data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.fid]);

  // Auto-fetch Farcaster data when user is detected
  useEffect(() => {
    if (user?.fid && !farcasterData) {
      fetchFarcasterData();
    }
  }, [user?.fid, farcasterData, fetchFarcasterData]);

  // SDK Actions
  const openUrl = useCallback(async (url: string) => {
    try {
      await sdk.actions.openUrl(url);
    } catch (err) {
      // Fallback for non-Mini App context
      window.open(url, '_blank');
    }
  }, []);

  const close = useCallback(async () => {
    try {
      await sdk.actions.close();
    } catch (err) {
      console.log('Cannot close - not in Mini App context');
    }
  }, []);

  return (
    <MiniAppContext.Provider
      value={{
        isReady,
        isMiniApp,
        user,
        isLoading,
        error,
        openUrl,
        close,
        farcasterData,
        fetchFarcasterData,
      }}
    >
      {children}
    </MiniAppContext.Provider>
  );
}

export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error('useMiniApp must be used within a MiniAppProvider');
  }
  return context;
}
