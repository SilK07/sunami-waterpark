/*
  # Recreate park_settings table

  1. New Tables
    - `park_settings`
      - `id` (uuid, primary key)
      - `timings` (jsonb) - stores openTime, closeTime, days
      - `prices` (jsonb) - stores weekday and weekend prices
      - `facilities` (jsonb) - stores lockerRoom and swimmingCostumes prices
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `park_settings` table
    - Add policies for public read access
    - Add policies for public insert/update access (for admin functionality)

  3. Initial Data
    - Insert default park settings with standard operating hours and pricing
*/

-- Create the park_settings table
CREATE TABLE IF NOT EXISTS park_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timings jsonb NOT NULL DEFAULT '{"days": "Monday - Sunday", "openTime": "10:00 AM", "closeTime": "5:00 PM"}'::jsonb,
  prices jsonb NOT NULL DEFAULT '{"weekday": 400, "weekend": 500}'::jsonb,
  facilities jsonb NOT NULL DEFAULT '{"lockerRoom": 50, "swimmingCostumes": 100}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE park_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public website)
CREATE POLICY "Anyone can read park settings"
  ON park_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert park settings"
  ON park_settings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update park settings"
  ON park_settings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert default park settings
INSERT INTO park_settings (timings, prices, facilities)
VALUES (
  '{"days": "Monday - Sunday", "openTime": "10:00 AM", "closeTime": "5:00 PM"}'::jsonb,
  '{"weekday": 400, "weekend": 500}'::jsonb,
  '{"lockerRoom": 50, "swimmingCostumes": 100}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create an updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_park_settings_updated_at ON park_settings;
CREATE TRIGGER update_park_settings_updated_at
    BEFORE UPDATE ON park_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();