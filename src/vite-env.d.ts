/// <reference types="vite/client" />

// Farcaster Mini App SDK types
interface FarcasterSDK {
  actions: {
    ready: () => Promise<void>;
  };
}

declare global {
  interface Window {
    sdk?: FarcasterSDK;
  }
}

export {};
