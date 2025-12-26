import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';

export type CombinedTierType = 'bronze' | 'silver' | 'gold' | 'diamond' | 'diamond-pro';

interface CombinedScoreCardProps {
  farcasterScore: number;
  baseScore: number;
  combinedScore: number;
  tier: CombinedTierType;
}

const tierConfig: Record<CombinedTierType, { color: string; label: string; glow: string }> = {
  bronze: { color: 'text-tier-bronze', label: 'Bronze', glow: 'glow-bronze' },
  silver: { color: 'text-tier-silver', label: 'Silver', glow: 'glow-silver' },
  gold: { color: 'text-tier-gold', label: 'Gold', glow: 'glow-gold' },
  diamond: { color: 'text-tier-diamond', label: 'Diamond', glow: 'glow-diamond' },
  'diamond-pro': { color: 'text-base', label: 'Base Diamond Pro', glow: 'shadow-[0_0_50px_hsl(220_90%_60%/0.5)]' },
};

export const CombinedScoreCard = ({ 
  farcasterScore, 
  baseScore, 
  combinedScore, 
  tier 
}: CombinedScoreCardProps) => {
  const config = tierConfig[tier];
  const farcasterPercent = (farcasterScore / 1000) * 100;
  const basePercent = (baseScore / 1000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 ${config.glow}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-farcaster to-base flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Combined Score</h3>
            <p className="text-sm text-muted-foreground">Social + On-chain</p>
          </div>
        </div>
        <div className="text-right">
          <motion.span 
            key={combinedScore}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-display font-bold text-3xl ${config.color}`}
          >
            {combinedScore}
          </motion.span>
          <span className="text-sm text-muted-foreground block">/ 1000</span>
        </div>
      </div>

      {/* Tier badge */}
      {tier === 'diamond-pro' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-base/20 border border-base/40 w-fit"
        >
          <Zap className="w-4 h-4 text-base" />
          <span className="text-base text-sm font-semibold">Base Diamond Pro</span>
        </motion.div>
      )}

      {/* Score breakdown */}
      <div className="space-y-4">
        {/* Farcaster Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-farcaster/20 flex items-center justify-center">
                <span className="text-xs font-bold text-farcaster">F</span>
              </div>
              <span className="text-sm text-muted-foreground">Farcaster (70%)</span>
            </div>
            <span className="font-display font-bold text-farcaster">{farcasterScore}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${farcasterPercent}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-farcaster rounded-full"
              style={{ boxShadow: '0 0 10px hsl(263 70% 58% / 0.5)' }}
            />
          </div>
        </div>

        {/* Base Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-base/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-base" viewBox="0 0 111 111" fill="currentColor">
                  <path d="M54.921 110.034C85.359 110.034 110.034 85.359 110.034 54.921C110.034 24.483 85.359 -0.192 54.921 -0.192C24.483 -0.192 -0.192 24.483 -0.192 54.921C-0.192 85.359 24.483 110.034 54.921 110.034Z" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Base (30%)</span>
            </div>
            <span className="font-display font-bold text-base">{baseScore}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${basePercent}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-base rounded-full"
              style={{ boxShadow: '0 0 10px hsl(220 90% 55% / 0.5)' }}
            />
          </div>
        </div>
      </div>

      {/* Formula hint */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Combined = (Farcaster × 70%) + (Base × 30%)
        </p>
      </div>
    </motion.div>
  );
};

export default CombinedScoreCard;
