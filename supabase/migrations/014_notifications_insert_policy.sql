-- Drop policy if it already exists
DROP POLICY IF EXISTS "Users can insert notifications." ON public.notifications;

-- Create policy to allow authenticated users to insert notifications
CREATE POLICY "Users can insert notifications."
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);
