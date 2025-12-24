-- Create leaderboard table to store user scores
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fid BIGINT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  casts INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  engagement DECIMAL(5,2) DEFAULT 0,
  nft_minted BOOLEAN DEFAULT FALSE,
  nft_token_id TEXT,
  nft_transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (leaderboard is public)
CREATE POLICY "Leaderboard is publicly readable" 
ON public.leaderboard 
FOR SELECT 
USING (true);

-- Create policy for insert (via edge function with service role)
CREATE POLICY "Allow insert via service role" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (true);

-- Create policy for update (via edge function with service role)
CREATE POLICY "Allow update via service role" 
ON public.leaderboard 
FOR UPDATE 
USING (true);

-- Create index for faster leaderboard queries
CREATE INDEX idx_leaderboard_score ON public.leaderboard (score DESC);
CREATE INDEX idx_leaderboard_fid ON public.leaderboard (fid);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();