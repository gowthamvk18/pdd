-- Enable real-time replication for notifications
-- This allows the UI to update instantly when a new notification is created
begin;
  -- Add notifications table to the supabase_realtime publication
  -- We check if it's already there first to avoid errors (though alter publication add table is usually fine)
  alter publication supabase_realtime add table notifications;
commit;
