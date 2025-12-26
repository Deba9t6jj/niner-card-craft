import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CacheScoreRequest {
  fid: number;
  baseScore: number;
  walletAddresses: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CacheScoreRequest = await req.json();
    
    console.log('Caching Base score for FID:', body.fid, 'Score:', body.baseScore);

    // Validate required fields
    if (!body.fid || body.baseScore === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fid, baseScore' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the current Farcaster score from the leaderboard
    const { data: existing, error: fetchError } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('fid', body.fid)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing score:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch existing data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!existing) {
      console.log('User not found in leaderboard, skipping cache');
      return new Response(
        JSON.stringify({ success: false, message: 'User not in leaderboard yet' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate combined score: (Farcaster × 70%) + (Base × 30%)
    const farcasterScore = existing.score || 0;
    const combinedScore = Math.round((farcasterScore * 0.7) + (body.baseScore * 0.3));

    console.log('Farcaster:', farcasterScore, 'Base:', body.baseScore, 'Combined:', combinedScore);

    // Update the leaderboard with cached Base score
    const { error: updateError } = await supabase
      .from('leaderboard')
      .update({
        base_score: body.baseScore,
        combined_score: combinedScore,
        wallet_addresses: body.walletAddresses || [],
        updated_at: new Date().toISOString(),
      })
      .eq('fid', body.fid);

    if (updateError) {
      console.error('Error updating leaderboard:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to cache score' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Score cached successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        farcasterScore,
        baseScore: body.baseScore,
        combinedScore,
      }),
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
