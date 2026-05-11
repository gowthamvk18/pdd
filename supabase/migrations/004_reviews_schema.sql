-- Create reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- A user can only leave one review per match
  UNIQUE(match_id, reviewer_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone."
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews."
  ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- IMPORTANT: Reload the schema cache so the API recognizes the new table
NOTIFY pgrst, 'reload schema';
