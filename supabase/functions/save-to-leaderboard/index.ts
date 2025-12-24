import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaderboardEntry {
  fid: number;
  username: string;
  display_name?: string;
  avatar_url?: string;
  score: number;
  tier: string;
  casts?: number;
  followers?: number;
  engagement?: number;
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

    const body: LeaderboardEntry = await req.json();
    
    console.log('Saving to leaderboard:', body);

    // Validate required fields
    if (!body.fid || !body.username || body.score === undefined || !body.tier) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fid, username, score, tier' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Upsert to leaderboard (update if fid exists, insert if new)
    const { data, error } = await supabase
      .from('leaderboard')
      .upsert(
        {
          fid: body.fid,
          username: body.username,
          display_name: body.display_name,
          avatar_url: body.avatar_url,
          score: body.score,
          tier: body.tier,
          casts: body.casts || 0,
          followers: body.followers || 0,
          engagement: body.engagement || 0,
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
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Saved successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
