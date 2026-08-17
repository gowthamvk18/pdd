-- Add privacy settings to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT true;

-- Update RLS policies to respect is_public for viewing other profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (
    is_public = true OR auth.uid() = id
  );
