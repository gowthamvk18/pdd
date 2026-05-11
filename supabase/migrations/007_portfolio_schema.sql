-- Create portfolio_items table
CREATE TABLE public.portfolio_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add privacy toggles to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT true;

-- Set up Row Level Security (RLS) for portfolio
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Portfolio Policies
CREATE POLICY "Portfolio items are viewable by everyone."
  ON public.portfolio_items FOR SELECT USING (true);

CREATE POLICY "Users can manage their own portfolio items."
  ON public.portfolio_items FOR ALL TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- IMPORTANT: Reload the schema cache
NOTIFY pgrst, 'reload schema';
