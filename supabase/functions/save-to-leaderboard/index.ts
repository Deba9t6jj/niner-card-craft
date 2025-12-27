import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaderboardRequest {
  fid: number;
  username: string;
}

const NEYNAR_API_KEY = Deno.env.get('NEYNAR_API_KEY');

// Server-side score calculation - prevents client manipulation
function calculateNinerScore(data: {
  followerCount: number;
  followingCount: number;
  totalCasts: number;
  totalReplies: number;
  totalRecasts: number;
  totalLikes: number;
  powerBadge: boolean;
}): number {
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

  return Math.min(Math.round(score), 999);
}

function getTier(score: number): string {
  if (score >= 801) return "diamond";
  if (score >= 501) return "gold";
  if (score >= 251) return "silver";
  return "bronze";
}

Deno.serve(async (req) => {
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!NEYNAR_API_KEY) {
      console.error('NEYNAR_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: LeaderboardRequest = await req.json();
    
    console.log('Leaderboard save request for FID:', body.fid);

    // Validate required fields - only FID and username required
    if (!body.fid || !body.username) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fid, username' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate FID is a positive integer
    if (!Number.isInteger(body.fid) || body.fid <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid FID format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // SECURITY: Verify FID ownership by fetching user data from Neynar API
    // This ensures the FID exists and validates the username matches
    console.log('Verifying FID with Neynar API...');
    
    const userResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${body.fid}`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': NEYNAR_API_KEY,
        },
      }
    );

    if (!userResponse.ok) {
      console.error('Neynar API error:', userResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user identity' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userData = await userResponse.json();
    const user = userData.users?.[0];

    if (!user) {
      console.error('User not found for FID:', body.fid);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify username matches the FID (case-insensitive)
    if (user.username.toLowerCase() !== body.username.toLowerCase()) {
      console.error('Username mismatch:', body.username, 'vs', user.username);
      return new Response(
        JSON.stringify({ error: 'Username does not match FID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User verified:', user.username);

    // Fetch user's casts to calculate activity SERVER-SIDE
    const castsResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/feed/user/casts?fid=${body.fid}&limit=100`,
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
      
      casts.forEach((cast: any) => {
        castStats.totalRecasts += cast.reactions?.recasts_count || 0;
        castStats.totalLikes += cast.reactions?.likes_count || 0;
      });
    }

    // Calculate score SERVER-SIDE - never trust client values
    const score = calculateNinerScore({
      followerCount: user.follower_count || 0,
      followingCount: user.following_count || 0,
      totalCasts: castStats.totalCasts,
      totalReplies: castStats.totalReplies,
      totalRecasts: castStats.totalRecasts,
      totalLikes: castStats.totalLikes,
      powerBadge: user.power_badge || false,
    });

    const tier = getTier(score);
    const engagement = user.follower_count > 0 
      ? Math.round((castStats.totalLikes + castStats.totalRecasts) / Math.max(castStats.totalCasts, 1) * 10) / 10
      : 0;

    console.log('Server-calculated score:', score, 'tier:', tier);

    // Check if user already exists to determine activity type
    const { data: existingUser } = await supabase
      .from('leaderboard')
      .select('id, score, tier')
      .eq('fid', user.fid)
      .maybeSingle();

    const isNewUser = !existingUser;
    const previousTier = existingUser?.tier;

    // Upsert to leaderboard with server-verified data only
    const { data, error } = await supabase
      .from('leaderboard')
      .upsert(
        {
          fid: user.fid,
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.pfp_url,
          score: score,
          tier: tier,
          casts: castStats.totalCasts,
          followers: user.follower_count || 0,
          engagement: engagement,
        },
        { 
          onConflict: 'fid',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save to leaderboard' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Saved successfully:', data);

    // Create activity for the live feed
    let activityType = 'score_updated';
    let activityData: Record<string, unknown> = { score, tier };

    if (isNewUser) {
      activityType = 'joined';
      activityData = { score, tier };
    } else if (previousTier && previousTier !== tier) {
      activityType = 'tier_achieved';
      activityData = { score, tier, previousTier };
    }

    // Insert activity (non-blocking, we don't wait for result)
    supabase
      .from('activities')
      .insert({
        fid: user.fid,
        username: user.username,
        avatar_url: user.pfp_url,
        action_type: activityType,
        action_data: activityData,
      })
      .then(({ error: activityError }) => {
        if (activityError) {
          console.error('Activity insert error:', activityError);
        } else {
          console.log('Activity created:', activityType);
        }
      });

    console.log('Activity queued:', activityType);

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
