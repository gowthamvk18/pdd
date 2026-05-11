-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see messages in their matches
CREATE POLICY "Users can view messages from their matches."
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = messages.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND m.status = 'accepted'
    )
  );

-- Create policy for users to insert messages in their matches
CREATE POLICY "Users can insert messages into their matches."
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND m.status = 'accepted'
    )
  );

-- Enable real-time for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
