import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BaseActivity {
  balance: string;
  balanceEth: number;
  transactionCount: number;
  nftCount: number;
  contractInteractions: number;
  recentTransactions: BaseTransaction[];
}

export interface BaseTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  type: 'send' | 'receive' | 'contract';
}

export interface BaseScoreData {
  score: number;
  activity: BaseActivity;
  walletAddress: string | null;
}

// Calculate Base on-chain score (0-1000)
const calculateBaseScore = (activity: BaseActivity): number => {
  let score = 0;
  
  // Balance score (max 300 points)
  // More ETH = higher score, capped at 1 ETH for max
  const balanceScore = Math.min(300, Math.floor(activity.balanceEth * 300));
  score += balanceScore;
  
  // Transaction history score (max 300 points)
  // More transactions = higher engagement
  const txScore = Math.min(300, Math.floor(activity.transactionCount * 3));
  score += txScore;
  
  // NFT ownership score (max 200 points)
  // Each NFT adds 20 points
  const nftScore = Math.min(200, activity.nftCount * 20);
  score += nftScore;
  
  // Contract interactions score (max 200 points)
  // Each interaction adds 10 points
  const contractScore = Math.min(200, activity.contractInteractions * 10);
  score += contractScore;
  
  return Math.min(1000, score);
};

export const useBaseScore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseData, setBaseData] = useState<BaseScoreData | null>(null);

  const fetchBaseScore = useCallback(async (walletAddresses: string[]) => {
    if (!walletAddresses.length) {
      setError('No wallet addresses provided');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-base-activity', {
        body: { walletAddresses },
      });

      if (fnError) throw fnError;

      if (data?.activity) {
        const score = calculateBaseScore(data.activity);
        const scoreData: BaseScoreData = {
          score,
          activity: data.activity,
          walletAddress: data.primaryWallet,
        };
        setBaseData(scoreData);
        return scoreData;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching Base activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Base activity');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBaseData(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    baseData,
    fetchBaseScore,
    reset,
  };
};
