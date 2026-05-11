-- Create notification_type enum
CREATE TYPE notification_type AS ENUM ('match_request', 'match_accepted', 'new_message', 'new_review');

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT, -- e.g., '/messages' or '/profile'
  is_read BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store extra IDs like match_id or reviewer_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can view their own notifications."
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications."
  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Helper function to create notifications (can be called from other functions or triggers)
-- For now we'll call it from the API side for simplicity, 
-- but in a production app, database triggers are better.

-- IMPORTANT: Reload the schema cache
NOTIFY pgrst, 'reload schema';
