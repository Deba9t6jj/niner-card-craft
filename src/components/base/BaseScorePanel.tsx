import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Activity, Image, Loader2 } from 'lucide-react';
import type { BaseActivity } from '@/hooks/useBaseScore';

interface BaseScorePanelProps {
  activity: BaseActivity | null;
  score: number;
  isLoading?: boolean;
}

export const BaseScorePanel = ({ activity, score, isLoading }: BaseScorePanelProps) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-base" />
          <span className="text-muted-foreground">Loading Base activity...</span>
        </div>
      </motion.div>
    );
  }

  if (!activity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-base/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-base" viewBox="0 0 111 111" fill="currentColor">
              <path d="M54.921 110.034C85.359 110.034 110.034 85.359 110.034 54.921C110.034 24.483 85.359 -0.192 54.921 -0.192C24.483 -0.192 -0.192 24.483 -0.192 54.921C-0.192 85.359 24.483 110.034 54.921 110.034Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Base Chain Activity</h3>
            <p className="text-sm text-muted-foreground">Connect wallet to see on-chain data</p>
          </div>
        </div>
        <div className="text-center py-6 text-muted-foreground">
          <p>No wallet connected yet</p>
        </div>
      </motion.div>
    );
  }

  const stats = [
    {
      label: 'Balance',
      value: `${activity.balanceEth.toFixed(4)} ETH`,
      icon: Wallet,
      color: 'text-base',
    },
    {
      label: 'Transactions',
      value: activity.transactionCount.toLocaleString(),
      icon: Activity,
      color: 'text-tier-gold',
    },
    {
      label: 'NFTs Owned',
      value: activity.nftCount.toLocaleString(),
      icon: Image,
      color: 'text-tier-diamond',
    },
    {
      label: 'Contracts',
      value: activity.contractInteractions.toLocaleString(),
      icon: ArrowUpRight,
      color: 'text-farcaster',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-base/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-base" viewBox="0 0 111 111" fill="currentColor">
              <path d="M54.921 110.034C85.359 110.034 110.034 85.359 110.034 54.921C110.034 24.483 85.359 -0.192 54.921 -0.192C24.483 -0.192 -0.192 24.483 -0.192 54.921C-0.192 85.359 24.483 110.034 54.921 110.034Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Base Chain Activity</h3>
            <p className="text-sm text-muted-foreground">On-chain reputation score</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-display font-bold text-2xl text-base">{score}</span>
          <span className="text-sm text-muted-foreground block">/ 1000</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background/50 rounded-lg p-3 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <span className={`font-display font-bold text-lg ${stat.color}`}>
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BaseScorePanel;
