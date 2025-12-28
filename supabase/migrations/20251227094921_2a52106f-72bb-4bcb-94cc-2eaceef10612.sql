-- Create activities table for live feed
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fid INTEGER,
  username TEXT NOT NULL,
  avatar_url TEXT,
  action_type TEXT NOT NULL, -- 'score_updated', 'nft_minted', 'tier_achieved', 'joined'
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read activities (public feed)
CREATE POLICY "Anyone can view activities"
ON public.activities
FOR SELECT
USING (true);

-- Allow inserts from edge functions (service role)
CREATE POLICY "Service role can insert activities"
ON public.activities
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;