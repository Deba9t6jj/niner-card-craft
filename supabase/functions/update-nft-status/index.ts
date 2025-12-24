import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateNFTRequest {
  fid: number;
  transactionHash: string;
  tokenId: string;
}

Deno.serve(async (req) => {
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: UpdateNFTRequest = await req.json();
    
    console.log('NFT status update request for FID:', body.fid);

    // Validate required fields
    if (!body.fid || !body.transactionHash || !body.tokenId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fid, transactionHash, tokenId' }),
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

    // Validate transaction hash format (basic hex check)
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(body.transactionHash)) {
      return new Response(
        JSON.stringify({ error: 'Invalid transaction hash format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate tokenId format (should be fid-timestamp)
    const tokenIdRegex = /^\d+-\d+$/;
    if (!tokenIdRegex.test(body.tokenId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid token ID format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify user exists in leaderboard first
    const { data: existingUser, error: fetchError } = await supabase
      .from('leaderboard')
      .select('fid, username, nft_minted')
      .eq('fid', body.fid)
      .single();

    if (fetchError || !existingUser) {
      console.error('User not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'User not found in leaderboard. Save your score first.' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if NFT already minted
    if (existingUser.nft_minted) {
      return new Response(
        JSON.stringify({ error: 'NFT already minted for this user' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Updating NFT status for user:', existingUser.username);

    // Update ONLY the NFT-related fields
    const { data, error } = await supabase
      .from('leaderboard')
      .update({
        nft_minted: true,
        nft_token_id: body.tokenId,
        nft_transaction_hash: body.transactionHash,
      })
      .eq('fid', body.fid)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update NFT status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('NFT status updated successfully for FID:', body.fid);

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
