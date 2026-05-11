-- Create session_status enum
CREATE TYPE session_status AS ENUM ('proposed', 'confirmed', 'cancelled', 'completed');

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  proposer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60 NOT NULL,
  status session_status DEFAULT 'proposed' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Sessions Policies
CREATE POLICY "Users can view their own sessions."
  ON public.sessions FOR SELECT TO authenticated 
  USING (auth.uid() = proposer_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert sessions for their matches."
  ON public.sessions FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Users can update their own sessions."
  ON public.sessions FOR UPDATE TO authenticated 
  USING (auth.uid() = proposer_id OR auth.uid() = receiver_id);

-- IMPORTANT: Reload the schema cache
NOTIFY pgrst, 'reload schema';
