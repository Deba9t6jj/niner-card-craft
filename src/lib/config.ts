export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || '',
  },
  neynar: {
    apiKey: '57A83244-75C0-4717-B5AF-96815BC4C8A5',
    apiUrl: 'https://api.neynar.com/v2',
  },
  farcaster: {
    botToken: 'wc_secret_67f4c7babe65e9dd884e74f259a76b0ba7ad74591813bcbd0b77da03_e70276e7',
    apiUrl: 'https://api.farcaster.xyz/v2',
  },
  app: {
    baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:5173',
  },
};

export function validateConfig() {
  if (!config.farcaster.botToken) console.warn('⚠️ Farcaster Bot Token missing');
  if (!config.neynar.apiKey) console.warn('⚠️ Neynar API Key missing');
  if (!config.supabase.url) console.warn('⚠️ Supabase URL missing');
  return true;
}