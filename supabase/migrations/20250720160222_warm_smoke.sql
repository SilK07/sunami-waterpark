/*
  # Enable Realtime for park_settings table

  1. Enable realtime replication for park_settings table
  2. This allows the frontend to receive live updates when data changes
*/

-- Enable realtime for the park_settings table
ALTER PUBLICATION supabase_realtime ADD TABLE park_settings;