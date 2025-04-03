-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  workspace_id TEXT,
  workspace_name TEXT,
  workspace_icon TEXT,
  bot_id TEXT,
  token_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active',
  
  -- Composite unique constraint to ensure one integration per provider per user
  UNIQUE(user_id, provider)
);

-- Add RLS policies
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to only see their own integrations
CREATE POLICY "Users can view their own integrations"
  ON public.integrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own integrations
CREATE POLICY "Users can insert their own integrations"
  ON public.integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own integrations
CREATE POLICY "Users can update their own integrations"
  ON public.integrations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own integrations
CREATE POLICY "Users can delete their own integrations"
  ON public.integrations
  FOR DELETE
  USING (auth.uid() = user_id);

