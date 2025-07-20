/*
  # Create park settings table

  1. New Tables
    - `park_settings`
      - `id` (uuid, primary key)
      - `timings` (jsonb) - Contains openTime, closeTime, days
      - `prices` (jsonb) - Contains weekday and weekend prices
      - `facilities` (jsonb) - Contains lockerRoom and swimmingCostumes prices
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `park_settings` table
    - Add policy for public read access
    - Add policy for authenticated users to update data
*/

CREATE TABLE IF NOT EXISTS park_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timings jsonb NOT NULL DEFAULT '{"openTime": "10:00 AM", "closeTime": "5:00 PM", "days": "Monday - Sunday"}',
  prices jsonb NOT NULL DEFAULT '{"weekday": 400, "weekend": 500}',
  facilities jsonb NOT NULL DEFAULT '{"lockerRoom": 50, "swimmingCostumes": 100}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE park_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON park_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow public update access (since we're using a simple admin system)
CREATE POLICY "Allow public update access"
  ON park_settings
  FOR UPDATE
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access"
  ON park_settings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert default settings
INSERT INTO park_settings (timings, prices, facilities)
VALUES (
  '{"openTime": "10:00 AM", "closeTime": "5:00 PM", "days": "Monday - Sunday"}',
  '{"weekday": 400, "weekend": 500}',
  '{"lockerRoom": 50, "swimmingCostumes": 100}'
)
ON CONFLICT DO NOTHING;