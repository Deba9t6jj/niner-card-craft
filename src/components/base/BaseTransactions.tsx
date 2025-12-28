import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, FileCode, ExternalLink } from 'lucide-react';
import type { BaseTransaction } from '@/hooks/useBaseScore';
import { formatDistanceToNow } from 'date-fns';

interface BaseTransactionsProps {
  transactions: BaseTransaction[];
}

const typeConfig = {
  send: { icon: ArrowUpRight, color: 'text-destructive', label: 'Sent' },
  receive: { icon: ArrowDownLeft, color: 'text-green-500', label: 'Received' },
  contract: { icon: FileCode, color: 'text-farcaster', label: 'Contract' },
};

export const BaseTransactions = ({ transactions }: BaseTransactionsProps) => {
  if (!transactions.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
      >
        <h3 className="font-display font-bold text-lg mb-4">Recent Transactions</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>No transactions found</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
    >
      <h3 className="font-display font-bold text-lg mb-4">Recent Base Transactions</h3>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {transactions.slice(0, 10).map((tx, index) => {
          const config = typeConfig[tx.type];
          const Icon = config.icon;
          const timeAgo = formatDistanceToNow(new Date(tx.timestamp * 1000), { addSuffix: true });
          
          return (
            <motion.div
              key={tx.hash}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50 hover:border-base/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{config.label}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {tx.value !== '0' && (
                  <span className={`font-display font-bold text-sm ${config.color}`}>
                    {parseFloat(tx.value).toFixed(4)} ETH
                  </span>
                )}
                <a
                  href={`https://basescan.org/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-base transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BaseTransactions;
