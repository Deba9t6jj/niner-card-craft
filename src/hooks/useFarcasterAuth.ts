import { useState, useCallback, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  verifiedAddresses: string[];
  activeStatus: string;
  powerBadge: boolean;
}

export interface FarcasterActivity {
  totalCasts: number;
  totalReplies: number;
  totalRecasts: number;
  totalLikes: number;
}

export interface FarcasterData {
  user: FarcasterUser;
  activity: FarcasterActivity;
  ninerScore: number;
}

// Validate username format on client side
const isValidUsername = (username: string): boolean => {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,19}(\.eth)?$/.test(username);
};

export function useFarcasterAuth() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<FarcasterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const { toast } = useToast();

  // Auto-detect Mini App context and fetch user data
  useEffect(() => {
    const checkMiniAppContext = async () => {
      try {
        const context = await sdk.context;
        if (context?.user?.fid) {
          setIsMiniApp(true);
          console.log('📱 Mini App detected, auto-fetching user data for FID:', context.user.fid);
          
          // Auto-fetch user data from SDK context
          setIsConnecting(true);
          const { data: statsData, error: statsError } = await supabase.functions.invoke('farcaster-auth', {
            body: { action: 'get_user_stats', fid: context.user.fid },
          });

          if (!statsError && statsData) {
            setData(statsData);
            setIsConnected(true);
            console.log('✅ Auto-connected via Mini App SDK');
          }
          setIsConnecting(false);
        }
      } catch (err) {
        // Not in Mini App context, user will connect manually
        console.log('ℹ️ Not in Mini App context');
      }
    };

    checkMiniAppContext();
  }, []);

  const connectByUsername = useCallback(async (username: string) => {
    setIsConnecting(true);
    setError(null);

    // Validate username before sending
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length > 25 || !isValidUsername(cleanUsername)) {
      setError('Invalid username format');
      setIsConnecting(false);
      toast({
        title: "Invalid Username",
        description: "Please enter a valid Farcaster username",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, lookup user by username to get FID
      const { data: lookupData, error: lookupError } = await supabase.functions.invoke('farcaster-auth', {
        body: { action: 'lookup_by_username', username: cleanUsername },
      });

      if (lookupError) {
        throw new Error(lookupError.message || 'Failed to lookup user');
      }

      // Handle user not found case
      if (lookupData?.notFound || !lookupData?.user?.fid) {
        throw new Error(lookupData?.message || `User "${cleanUsername}" not found on Farcaster`);
      }

      const fid = lookupData.user.fid;

      // Now get full stats
      const { data: statsData, error: statsError } = await supabase.functions.invoke('farcaster-auth', {
        body: { action: 'get_user_stats', fid },
      });

      if (statsError) {
        throw new Error(statsError.message || 'Failed to get user stats');
      }

      setData(statsData);
      setIsConnected(true);
      
      toast({
        title: "Connected!",
        description: `Welcome, ${statsData.user.displayName || statsData.user.username}!`,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      toast({
        title: "Connection Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const connectByFid = useCallback(async (fid: number) => {
    setIsConnecting(true);
    setError(null);

    try {
      const { data: statsData, error: statsError } = await supabase.functions.invoke('farcaster-auth', {
        body: { action: 'get_user_stats', fid },
      });

      if (statsError) {
        throw new Error(statsError.message || 'Failed to get user stats');
      }

      setData(statsData);
      setIsConnected(true);
      
      toast({
        title: "Connected!",
        description: `Welcome, ${statsData.user.displayName || statsData.user.username}!`,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      toast({
        title: "Connection Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    setData(null);
    setIsConnected(false);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!data?.user?.fid) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const { data: statsData, error: statsError } = await supabase.functions.invoke('farcaster-auth', {
        body: { action: 'get_user_stats', fid: data.user.fid },
      });

      if (statsError) {
        throw new Error(statsError.message || 'Failed to refresh stats');
      }

      setData(statsData);
      
      toast({
        title: "Stats refreshed!",
        description: "Your Farcaster data is now up to date.",
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh';
      setError(message);
      toast({
        title: "Refresh Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [data?.user?.fid, toast]);

  return {
    isConnecting,
    isConnected,
    data,
    error,
    isMiniApp,
    connectByUsername,
    connectByFid,
    disconnect,
    refresh,
  };
}
