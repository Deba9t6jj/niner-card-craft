-- Add base_score column to leaderboard table for caching combined scores
ALTER TABLE public.leaderboard 
ADD COLUMN IF NOT EXISTS base_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS combined_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS wallet_addresses text[] DEFAULT ARRAY[]::text[];