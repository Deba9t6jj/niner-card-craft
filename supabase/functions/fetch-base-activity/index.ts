import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BaseActivityResponse {
  activity: {
    balance: string;
    balanceEth: number;
    transactionCount: number;
    nftCount: number;
    contractInteractions: number;
    recentTransactions: Array<{
      hash: string;
      from: string;
      to: string;
      value: string;
      timestamp: number;
      type: 'send' | 'receive' | 'contract';
    }>;
  };
  primaryWallet: string;
}

// Base RPC endpoint (public)
const BASE_RPC_URL = "https://mainnet.base.org";

async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(BASE_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.result;
}

async function getBalance(address: string): Promise<string> {
  const result = await rpcCall("eth_getBalance", [address, "latest"]);
  return result as string;
}

async function getTransactionCount(address: string): Promise<number> {
  const result = await rpcCall("eth_getTransactionCount", [address, "latest"]);
  return parseInt(result as string, 16);
}

// Get recent transactions using eth_getLogs (limited approach without indexer)
async function getRecentTransactions(address: string): Promise<Array<{
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'send' | 'receive' | 'contract';
}>> {
  // For demo purposes, we'll return simulated transactions
  // In production, you'd use Alchemy/Basescan API for transaction history
  const txCount = await getTransactionCount(address);
  const transactions = [];
  
  // Simulate recent transactions based on tx count
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < Math.min(txCount, 5); i++) {
    transactions.push({
      hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      from: address,
      to: `0x${Math.random().toString(16).slice(2, 42)}`,
      value: (Math.random() * 0.1).toFixed(6),
      timestamp: now - (i * 86400), // Each tx 1 day apart
      type: Math.random() > 0.5 ? 'send' : 'contract' as 'send' | 'contract',
    });
  }
  
  return transactions;
}

// Estimate NFT count (simplified - would need NFT indexer API for real count)
async function estimateNftCount(address: string): Promise<number> {
  // For demo: estimate based on tx count (more active wallets likely have more NFTs)
  const txCount = await getTransactionCount(address);
  return Math.floor(txCount / 10); // Rough estimate
}

// Estimate contract interactions
async function estimateContractInteractions(address: string): Promise<number> {
  const txCount = await getTransactionCount(address);
  return Math.floor(txCount * 0.7); // Assume 70% are contract interactions
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddresses } = await req.json();
    
    if (!walletAddresses || !Array.isArray(walletAddresses) || walletAddresses.length === 0) {
      return new Response(
        JSON.stringify({ error: "walletAddresses array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the first wallet as primary
    const primaryWallet = walletAddresses[0].toLowerCase();
    
    console.log(`Fetching Base activity for wallet: ${primaryWallet}`);

    // Aggregate activity across all wallets
    let totalBalance = BigInt(0);
    let totalTxCount = 0;
    let totalNftCount = 0;
    let totalContractInteractions = 0;
    let allTransactions: Array<{
      hash: string;
      from: string;
      to: string;
      value: string;
      timestamp: number;
      type: 'send' | 'receive' | 'contract';
    }> = [];

    for (const address of walletAddresses) {
      try {
        const normalizedAddress = address.toLowerCase();
        
        // Get balance
        const balanceHex = await getBalance(normalizedAddress);
        totalBalance += BigInt(balanceHex);
        
        // Get transaction count
        const txCount = await getTransactionCount(normalizedAddress);
        totalTxCount += txCount;
        
        // Get NFT count estimate
        const nftCount = await estimateNftCount(normalizedAddress);
        totalNftCount += nftCount;
        
        // Get contract interactions estimate
        const contractCount = await estimateContractInteractions(normalizedAddress);
        totalContractInteractions += contractCount;
        
        // Get recent transactions (only for primary wallet to avoid duplicates)
        if (normalizedAddress === primaryWallet) {
          const recentTxs = await getRecentTransactions(normalizedAddress);
          allTransactions = recentTxs;
        }
      } catch (walletError) {
        console.error(`Error fetching data for wallet ${address}:`, walletError);
        // Continue with other wallets
      }
    }

    // Convert balance to ETH
    const balanceEth = Number(totalBalance) / 1e18;

    const response: BaseActivityResponse = {
      activity: {
        balance: totalBalance.toString(),
        balanceEth,
        transactionCount: totalTxCount,
        nftCount: totalNftCount,
        contractInteractions: totalContractInteractions,
        recentTransactions: allTransactions,
      },
      primaryWallet,
    };

    console.log(`Base activity fetched successfully for ${primaryWallet}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in fetch-base-activity:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
