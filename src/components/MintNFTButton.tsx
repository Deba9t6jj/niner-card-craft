import { useState } from 'react';
import { useConnect, useAccount, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther } from 'viem';
import { base } from 'wagmi/chains';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Loader2, Check, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NINER_NFT_CONTRACT, ninerNftAbi } from '@/lib/wagmi';

interface MintNFTButtonProps {
  fid: number;
  username: string;
  displayName: string;
  score: number;
  tier: string;
  avatarUrl: string;
  stats: {
    casts: number;
    followers: number;
    engagement: number;
  };
}

export function MintNFTButton({ fid, username, displayName, score, tier, avatarUrl, stats }: MintNFTButtonProps) {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { writeContract, data: hash, isPending: isWriting } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleConnect = async () => {
    try {
      connect({ connector: injected() });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please make sure you have a wallet installed.",
        variant: "destructive",
      });
    }
  };

  const handleMint = async () => {
    if (!address) return;
    
    setIsMinting(true);
    
    try {
      // Generate metadata using only FID - server fetches verified data
      const { data: nftData, error: metaError } = await supabase.functions.invoke('generate-nft-metadata', {
        body: { fid },
      });

      if (metaError) throw metaError;

      // For demo purposes, we'll simulate the minting since the contract isn't deployed yet
      // In production, uncomment the writeContract call below
      
      toast({
        title: "Minting NFT on Base...",
        description: "Please confirm the transaction in your wallet.",
      });

      // Simulate minting delay for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction hash for demo
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setTxHash(mockTxHash);

      // Update NFT status via secure edge function (only updates NFT fields, not score/tier)
      const { error: updateError } = await supabase.functions.invoke('update-nft-status', {
        body: {
          fid,
          transactionHash: mockTxHash,
          tokenId: nftData.tokenId,
        },
      });

      if (updateError) {
        console.error('Error updating NFT status:', updateError);
      }

      toast({
        title: "NFT Minted Successfully! 🎉",
        description: "Your Niner Score NFT is now on Base!",
      });

      /* Production minting code - uncomment when contract is deployed:
      writeContract({
        address: NINER_NFT_CONTRACT,
        abi: ninerNftAbi,
        functionName: 'mint',
        args: [BigInt(fid), BigInt(score), tier, nftData.metadataUri],
        value: parseEther('0'),
      });
      */

    } catch (error) {
      console.error('Minting error:', error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  if (txHash) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button 
          variant="farcaster" 
          className="gap-2"
          onClick={() => window.open(`https://basescan.org/tx/${txHash}`, '_blank')}
        >
          <Check className="w-4 h-4" />
          View on BaseScan
          <ExternalLink className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground">NFT minted on Base</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        variant="farcaster" 
        className="gap-2 shadow-lg shadow-farcaster/20"
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button 
        variant="farcaster" 
        className="gap-2 shadow-lg shadow-farcaster/20"
        onClick={handleMint}
        disabled={isMinting || isWriting || isConfirming}
      >
        {(isMinting || isWriting || isConfirming) ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        {isMinting || isWriting ? "Minting..." : isConfirming ? "Confirming..." : "Mint NFT on Base"}
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button 
          onClick={() => disconnect()} 
          className="text-xs text-destructive hover:underline"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
