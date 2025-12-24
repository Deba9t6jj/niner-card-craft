import { useState, useCallback } from 'react';
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

export function useFarcasterAuth() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<FarcasterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const connectByUsername = useCallback(async (username: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // First, lookup user by username to get FID
      const { data: lookupData, error: lookupError } = await supabase.functions.invoke('farcaster-auth', {
        body: { action: 'lookup_by_username', username },
      });

      if (lookupError) {
        throw new Error(lookupError.message || 'Failed to lookup user');
      }

      if (!lookupData?.user?.fid) {
        throw new Error('User not found on Farcaster');
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
    connectByUsername,
    disconnect,
    refresh,
  };
}
