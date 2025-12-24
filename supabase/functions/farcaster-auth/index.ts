import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NEYNAR_API_KEY = Deno.env.get('NEYNAR_API_KEY');

// In-memory store for auth channels (in production, use a database)
const authChannels = new Map<string, {
  nonce: string;
  state: 'pending' | 'completed' | 'error';
  fid?: number;
  message?: string;
  createdAt: number;
}>();

// Clean up old channels every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, channel] of authChannels) {
    // Remove channels older than 10 minutes
    if (now - channel.createdAt > 10 * 60 * 1000) {
      authChannels.delete(token);
    }
  }
}, 5 * 60 * 1000);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, fid, nonce, channelToken } = await req.json();
    console.log(`Farcaster auth action: ${action}`);

    if (!NEYNAR_API_KEY) {
      console.error('NEYNAR_API_KEY is not configured');
      throw new Error('Neynar API key not configured');
    }

    // Create a new Sign In with Farcaster channel
    if (action === 'create_signin_channel') {
      // Create auth channel using Neynar's SIWN API
      const response = await fetch('https://api.neynar.com/v2/farcaster/login/authorize', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'x-api-key': NEYNAR_API_KEY,
        },
        body: JSON.stringify({
          response_type: 'code',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Neynar auth channel error:', response.status, errorText);
        throw new Error(`Failed to create auth channel: ${response.status}`);
      }

      const data = await response.json();
      console.log('Auth channel created:', JSON.stringify(data));

      // Store the channel info
      const token = data.signer_uuid || crypto.randomUUID();
      authChannels.set(token, {
        nonce: nonce || crypto.randomUUID(),
        state: 'pending',
        createdAt: Date.now(),
      });

      return new Response(JSON.stringify({
        channelToken: token,
        url: data.authorization_url,
        signerUuid: data.signer_uuid,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check the status of a Sign In with Farcaster request
    if (action === 'check_signin_status') {
      if (!channelToken) {
        throw new Error('Channel token required');
      }

      // Check status with Neynar
      const response = await fetch(`https://api.neynar.com/v2/farcaster/login/authorize?signer_uuid=${channelToken}`, {
        headers: {
          'accept': 'application/json',
          'x-api-key': NEYNAR_API_KEY,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Neynar status check error:', response.status, errorText);
        
        return new Response(JSON.stringify({
          state: 'pending',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      console.log('Auth status:', JSON.stringify(data));

      // Check if authentication is complete
      if (data.state === 'approved' && data.fid) {
        return new Response(JSON.stringify({
          state: 'completed',
          fid: data.fid,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (data.state === 'pending') {
        return new Response(JSON.stringify({
          state: 'pending',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Handle error or rejected states
      return new Response(JSON.stringify({
        state: 'error',
        message: data.message || 'Authentication failed',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_user_stats') {
      // Validate FID is a positive integer
      if (!fid || !Number.isInteger(fid) || fid <= 0) {
        throw new Error('Valid FID required');
      }

      // Get user profile and stats by FID
      const userResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': NEYNAR_API_KEY,
          },
        }
      );

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('Neynar user API error:', userResponse.status, errorText);
        throw new Error(`Failed to get user: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      const user = userData.users?.[0];
      
      if (!user) {
        throw new Error('User not found');
      }

      console.log('User data:', JSON.stringify(user));

      // Calculate engagement and activity metrics
      const stats = {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile?.bio?.text || '',
        followerCount: user.follower_count || 0,
        followingCount: user.following_count || 0,
        verifiedAddresses: user.verified_addresses?.eth_addresses || [],
        activeStatus: user.active_status,
        powerBadge: user.power_badge || false,
      };

      // Get user's casts to calculate activity
      const castsResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${fid}&limit=100`,
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': NEYNAR_API_KEY,
          },
        }
      );

      let castStats = {
        totalCasts: 0,
        totalReplies: 0,
        totalRecasts: 0,
        totalLikes: 0,
      };

      if (castsResponse.ok) {
        const castsData = await castsResponse.json();
        const casts = castsData.casts || [];
        
        castStats.totalCasts = casts.length;
        castStats.totalReplies = casts.filter((c: any) => c.parent_hash).length;
        
        // Sum up engagement on user's casts
        casts.forEach((cast: any) => {
          castStats.totalRecasts += cast.reactions?.recasts_count || 0;
          castStats.totalLikes += cast.reactions?.likes_count || 0;
        });
      }

      // Calculate Niner Score
      const score = calculateNinerScore({
        ...stats,
        ...castStats,
      });

      console.log('Calculated score:', score);

      return new Response(JSON.stringify({
        user: stats,
        activity: castStats,
        ninerScore: score,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in farcaster-auth function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateNinerScore(data: {
  followerCount: number;
  followingCount: number;
  totalCasts: number;
  totalReplies: number;
  totalRecasts: number;
  totalLikes: number;
  powerBadge: boolean;
}): number {
  // Scoring algorithm
  let score = 0;
  
  // Followers (max 250 points)
  score += Math.min(data.followerCount * 0.5, 250);
  
  // Following ratio bonus (max 50 points)
  if (data.followingCount > 0) {
    const ratio = data.followerCount / data.followingCount;
    score += Math.min(ratio * 10, 50);
  }
  
  // Casts (max 150 points)
  score += Math.min(data.totalCasts * 1.5, 150);
  
  // Replies - shows engagement (max 100 points)
  score += Math.min(data.totalReplies * 2, 100);
  
  // Recasts received (max 200 points)
  score += Math.min(data.totalRecasts * 3, 200);
  
  // Likes received (max 150 points)
  score += Math.min(data.totalLikes * 0.5, 150);
  
  // Power badge bonus
  if (data.powerBadge) {
    score += 100;
  }

  // Normalize to 0-999 scale
  return Math.min(Math.round(score), 999);
}
