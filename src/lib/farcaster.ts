// src/lib/farcaster.ts
import { supabase } from '@/integrations/supabase/client';

export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  avatar_url: string;
  followers: number;
  following: number;
  casts: number;
}

export async function getFarcasterUserByFid(fid: number): Promise<FarcasterUser | null> {
  try {
    // First check if we have cached data in Supabase
    const { data: cached, error: cacheError } = await supabase
      .from('farcaster_profiles')
      .select('*')
      .eq('fid', fid)
      .maybeSingle();

    if (!cacheError && cached) {
      console.log('✅ Using cached Farcaster data');
      return cached as FarcasterUser;
    }

    // If not cached, fetch from Neynar API (you need to add your API key)
    const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY;
    
    if (!NEYNAR_API_KEY) {
      console.error('❌ Neynar API key missing! Add VITE_NEYNAR_API_KEY to .env file');
      return null;
    }

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user?fid=${fid}`,
      {
        headers: {
          'api_key': NEYNAR_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.user) {
      const userData: FarcasterUser = {
        fid: data.user.fid,
        username: data.user.username,
        display_name: data.user.display_name,
        avatar_url: data.user.pfp_url,
        followers: data.user.follower_count,
        following: data.user.following_count,
        casts: data.user.casts,
      };

      // Cache in Supabase for future use
      await supabase
        .from('farcaster_profiles')
        .upsert({
          fid: userData.fid,
          username: userData.username,
          display_name: userData.display_name,
          avatar_url: userData.avatar_url,
          followers: userData.followers,
          following: userData.following,
          casts: userData.casts,
          updated_at: new Date().toISOString(),
        });

      return userData;
    }

    return null;
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return null;
  }
}

export async function getFarcasterUserByUsername(username: string): Promise<FarcasterUser | null> {
  try {
    const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY;
    
    if (!NEYNAR_API_KEY) {
      console.error('❌ Neynar API key missing!');
      return null;
    }

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user?username=${username}`,
      {
        headers: {
          'api_key': NEYNAR_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.user) {
      return {
        fid: data.user.fid,
        username: data.user.username,
        display_name: data.user.display_name,
        avatar_url: data.user.pfp_url,
        followers: data.user.follower_count,
        following: data.user.following_count,
        casts: data.user.casts,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Farcaster user by username:', error);
    return null;
  }
}
