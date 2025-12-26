import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectorProps {
  verifiedAddresses: string[];
  onAddWallet: (address: string) => Promise<void>;
  onRemoveWallet?: (address: string) => void;
  isLoading?: boolean;
}

const isValidEthAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const WalletConnector = ({
  verifiedAddresses,
  onAddWallet,
  onRemoveWallet,
  isLoading,
}: WalletConnectorProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddWallet = async () => {
    if (!newAddress.trim()) return;

    if (!isValidEthAddress(newAddress.trim())) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Ethereum address.',
        variant: 'destructive',
      });
      return;
    }

    if (verifiedAddresses.some(addr => addr.toLowerCase() === newAddress.toLowerCase())) {
      toast({
        title: 'Already Added',
        description: 'This wallet is already connected.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddWallet(newAddress.trim());
      setNewAddress('');
      setIsAdding(false);
      toast({
        title: 'Wallet Added',
        description: 'Base activity will be fetched for this wallet.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-base/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-base" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Connected Wallets</h3>
            <p className="text-sm text-muted-foreground">
              {verifiedAddresses.length} wallet{verifiedAddresses.length !== 1 ? 's' : ''} connected
            </p>
          </div>
        </div>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Wallet
          </Button>
        )}
      </div>

      {/* Add wallet form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="font-mono text-sm"
                disabled={isSubmitting}
              />
              <Button
                onClick={handleAddWallet}
                disabled={!newAddress.trim() || isSubmitting}
                size="icon"
                className="shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsAdding(false);
                  setNewAddress('');
                }}
                disabled={isSubmitting}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet list */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading wallets...</span>
        </div>
      ) : verifiedAddresses.length > 0 ? (
        <div className="space-y-2">
          {verifiedAddresses.map((address, index) => (
            <motion.div
              key={address}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-2 px-3 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-base/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-base" viewBox="0 0 111 111" fill="currentColor">
                    <path d="M54.921 110.034C85.359 110.034 110.034 85.359 110.034 54.921C110.034 24.483 85.359 -0.192 54.921 -0.192C24.483 -0.192 -0.192 24.483 -0.192 54.921C-0.192 85.359 24.483 110.034 54.921 110.034Z" />
                  </svg>
                </div>
                <span className="font-mono text-sm">{truncateAddress(address)}</span>
              </div>
              {onRemoveWallet && index > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveWallet(address)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No wallets connected yet. Add a wallet to see Base activity.
        </div>
      )}
    </motion.div>
  );
};

export default WalletConnector;
