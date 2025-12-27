import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { createWalletClient, custom, type WalletClient, type Address } from 'viem';
import { base } from 'viem/chains';

interface MiniAppWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: Address | null;
  walletClient: WalletClient | null;
  isMiniApp: boolean;
  error: Error | null;
}

interface UseMiniAppWalletReturn extends MiniAppWalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

export function useMiniAppWallet(): UseMiniAppWalletReturn {
  const [state, setState] = useState<MiniAppWalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    walletClient: null,
    isMiniApp: false,
    error: null,
  });

  // Check if running inside Mini App context
  useEffect(() => {
    const checkMiniAppContext = async () => {
      try {
        const context = await sdk.context;
        if (context) {
          setState(prev => ({ ...prev, isMiniApp: true }));
          console.log('📱 Mini App wallet context detected');
          
          // Check for ethProvider and try to get accounts
          const provider = sdk.wallet.ethProvider;
          if (provider) {
            try {
              const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
              if (accounts.length > 0) {
                const primaryAddress = accounts[0] as Address;
                const client = createWalletClient({
                  chain: base,
                  transport: custom(provider),
                });
                
                setState(prev => ({
                  ...prev,
                  isConnected: true,
                  address: primaryAddress,
                  walletClient: client,
                }));
                console.log('✅ Auto-connected to Mini App wallet:', primaryAddress);
              }
            } catch (err) {
              console.log('ℹ️ Wallet not yet connected in Mini App');
            }
          }
        }
      } catch (error) {
        // Not in Mini App context
        console.log('ℹ️ Not in Mini App context, using standard wallet flow');
      }
    };

    checkMiniAppContext();
  }, []);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Check if we're in Mini App context
      const context = await sdk.context;
      
      if (context && sdk.wallet.ethProvider) {
        // Use SDK's ethProvider for Mini App
        const provider = sdk.wallet.ethProvider;
        
        // Request accounts through the provider
        const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
        
        if (accounts.length > 0) {
          const address = accounts[0] as Address;
          const client = createWalletClient({
            chain: base,
            transport: custom(provider),
          });

          setState(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            address,
            walletClient: client,
          }));
          
          console.log('✅ Connected via Mini App SDK:', address);
          return;
        }
      }
      
      // Fallback: Not in Mini App, will use standard wagmi flow
      throw new Error('Not in Mini App context');
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to connect wallet');
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err,
      }));
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      address: null,
      walletClient: null,
      error: null,
    }));
    console.log('🔌 Wallet disconnected');
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!state.address) {
      console.error('No address connected');
      return null;
    }

    try {
      // Use SDK's signTypedData or ethProvider for signing
      const provider = sdk.wallet.ethProvider;
      if (provider) {
        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, state.address],
        }) as string;
        
        console.log('✅ Message signed via Mini App SDK');
        return signature;
      }
      
      // Fallback to walletClient
      if (state.walletClient) {
        const signature = await state.walletClient.signMessage({
          account: state.address,
          message,
        });
        return signature;
      }
      
      return null;
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  }, [state.address, state.walletClient]);

  return {
    ...state,
    connect,
    disconnect,
    signMessage,
  };
}
