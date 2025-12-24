import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';

// Niner Score NFT contract on Base (placeholder - will need actual deployed contract)
export const NINER_NFT_CONTRACT = '0x0000000000000000000000000000000000000000' as const;

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
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
