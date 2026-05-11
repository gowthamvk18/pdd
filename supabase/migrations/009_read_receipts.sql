-- Add is_read column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_messages_match_id_is_read ON public.messages(match_id, is_read) WHERE is_read = false;

-- IMPORTANT: Reload the schema cache
NOTIFY pgrst, 'reload schema';
