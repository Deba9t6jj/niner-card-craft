import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'send' | 'receive' | 'contract';
}

interface BaseActivityResponse {
  activity: {
    balance: string;
    balanceEth: number;
    transactionCount: number;
    nftCount: number;
    contractInteractions: number;
    recentTransactions: Transaction[];
  };
  primaryWallet: string;
}

// Basescan API endpoint
const BASESCAN_API_URL = "https://api.basescan.org/api";
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

// Fetch real transactions from Basescan API
async function getRealTransactions(
  address: string, 
  apiKey: string
): Promise<{ transactions: Transaction[], txCount: number, contractInteractions: number }> {
  try {
    const url = `${BASESCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`;
    
    console.log(`Fetching transactions from Basescan for ${address}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "1" || !data.result || !Array.isArray(data.result)) {
      console.log("No transactions found or API error:", data.message);
      return { transactions: [], txCount: 0, contractInteractions: 0 };
    }
    
    let contractInteractions = 0;
    
    const transactions: Transaction[] = data.result.slice(0, 10).map((tx: {
      hash: string;
      from: string;
      to: string;
      value: string;
      timeStamp: string;
      input: string;
    }) => {
      const isContract = tx.input && tx.input !== "0x";
      if (isContract) contractInteractions++;
      
      return {
        hash: tx.hash,
        from: tx.from.toLowerCase(),
        to: tx.to?.toLowerCase() || "",
        value: (parseInt(tx.value) / 1e18).toFixed(6),
        timestamp: parseInt(tx.timeStamp),
        type: tx.from.toLowerCase() === address.toLowerCase() 
          ? (isContract ? 'contract' : 'send') 
          : 'receive' as 'send' | 'receive' | 'contract',
      };
    });
    
    return { 
      transactions, 
      txCount: data.result.length, 
      contractInteractions 
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { transactions: [], txCount: 0, contractInteractions: 0 };
  }
}

// Fetch real NFT holdings from Basescan API
async function getNftCount(address: string, apiKey: string): Promise<number> {
  try {
    // Get ERC-721 transfers to this address (NFTs received)
    const url = `${BASESCAN_API_URL}?module=account&action=tokennfttx&address=${address}&page=1&offset=100&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== "1" || !data.result || !Array.isArray(data.result)) {
      return 0;
    }
    
    // Count unique NFTs owned (received - sent)
    const nftBalance = new Map<string, number>();
    
    for (const tx of data.result) {
      const key = `${tx.contractAddress}-${tx.tokenID}`;
      if (tx.to.toLowerCase() === address.toLowerCase()) {
        nftBalance.set(key, (nftBalance.get(key) || 0) + 1);
      } else if (tx.from.toLowerCase() === address.toLowerCase()) {
        nftBalance.set(key, (nftBalance.get(key) || 0) - 1);
      }
    }
    
    // Count NFTs with positive balance
    let count = 0;
    for (const balance of nftBalance.values()) {
      if (balance > 0) count += balance;
    }
    
    return count;
  } catch (error) {
    console.error("Error fetching NFT count:", error);
    return 0;
  }
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

    const apiKey = Deno.env.get("BASESCAN_API_KEY");
    if (!apiKey) {
      console.error("BASESCAN_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Basescan API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    let allTransactions: Transaction[] = [];

    for (const address of walletAddresses) {
      try {
        const normalizedAddress = address.toLowerCase();
        
        // Get balance from RPC
        const balanceHex = await getBalance(normalizedAddress);
        totalBalance += BigInt(balanceHex);
        
        // Get real transaction data from Basescan
        const { transactions, txCount, contractInteractions } = await getRealTransactions(normalizedAddress, apiKey);
        totalTxCount += txCount;
        totalContractInteractions += contractInteractions;
        
        // Get real NFT count from Basescan
        const nftCount = await getNftCount(normalizedAddress, apiKey);
        totalNftCount += nftCount;
        
        // Collect transactions (only for primary wallet to avoid duplicates)
        if (normalizedAddress === primaryWallet) {
          allTransactions = transactions;
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
    console.log(`Balance: ${balanceEth} ETH, Txs: ${totalTxCount}, NFTs: ${totalNftCount}`);

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
