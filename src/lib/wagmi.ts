import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { sdk } from '@farcaster/miniapp-sdk';
import { custom, type EIP1193Provider } from 'viem';

// Niner Score NFT contract on Base (placeholder - will need actual deployed contract)
export const NINER_NFT_CONTRACT = '0x0000000000000000000000000000000000000000' as const;

// Check if Mini App SDK provider is available
const getMiniAppTransport = () => {
  try {
    const provider = sdk.wallet.ethProvider;
    if (provider) {
      return custom(provider as EIP1193Provider);
    }
  } catch {
    // Not in Mini App context
  }
  return http();
};

// Helper to check if we're in Mini App context
export const isMiniAppContext = async (): Promise<boolean> => {
  try {
    const context = await sdk.context;
    return !!context;
  } catch {
    return false;
  }
};

// Get the Mini App ethProvider if available
export const getMiniAppProvider = (): EIP1193Provider | null => {
  try {
    return sdk.wallet.ethProvider as EIP1193Provider;
  } catch {
    return null;
  }
};

export const config = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: getMiniAppTransport(),
  },
});

// NFT Contract ABI for minting
export const ninerNftAbi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'fid', type: 'uint256' },
      { name: 'score', type: 'uint256' },
      { name: 'tier', type: 'string' },
      { name: 'metadataURI', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;
