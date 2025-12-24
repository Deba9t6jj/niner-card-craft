import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  'https://vdxsmqqzjvobgboczeyd.lovableproject.com',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

const NEYNAR_API_KEY = Deno.env.get('NEYNAR_API_KEY');

// Validate username format server-side
const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  if (username.length > 25) return false;
  // Farcaster usernames: alphanumeric, dots, dashes, underscores, can have .eth suffix
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,19}(\.eth)?$/.test(username);
};

// Validate FID format
const isValidFid = (fid: any): boolean => {
  return typeof fid === 'number' && Number.isInteger(fid) && fid > 0 && fid < 10000000000;
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, fid, username } = await req.json();
    console.log(`Farcaster auth action: ${action}`);

    if (!NEYNAR_API_KEY) {
      console.error('NEYNAR_API_KEY is not configured');
      throw new Error('Neynar API key not configured');
    }

    if (action === 'lookup_by_username') {
      // Validate username server-side
      if (!username || !isValidUsername(username)) {
        console.error('Invalid username format:', username);
        return new Response(
          JSON.stringify({ error: 'Invalid username format' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const cleanUsername = username.trim().toLowerCase();
      console.log('Looking up username:', cleanUsername);

      // Look up user by username
      const response = await fetch(
        `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(cleanUsername)}`,
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': NEYNAR_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Neynar API error:', response.status, errorText);
        
        if (response.status === 404) {
          return new Response(
            JSON.stringify({ error: 'User not found on Farcaster' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        throw new Error(`Failed to lookup user: ${response.status}`);
      }

      const data = await response.json();
      console.log('User lookup successful for:', data.user?.username);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_user_stats') {
      // Validate FID server-side
      if (!isValidFid(fid)) {
        console.error('Invalid FID format:', fid);
        return new Response(
          JSON.stringify({ error: 'Invalid FID format' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Getting stats for FID:', fid);

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

      console.log('User data retrieved for:', user.username);

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
    const corsHeaders = getCorsHeaders(req);
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
