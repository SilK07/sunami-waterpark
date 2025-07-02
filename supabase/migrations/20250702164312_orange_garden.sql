/*
  # Create Water Park Database Schema

  1. New Tables
    - `park_settings`
      - `id` (uuid, primary key)
      - `timings` (jsonb) - Store opening hours and days
      - `prices` (jsonb) - Store weekday and weekend pricing
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `gallery_images`
      - `id` (uuid, primary key)
      - `image_url` (text) - URL or base64 data of the image
      - `display_order` (integer) - Order for displaying images
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated admin write access
*/

-- Create park_settings table
CREATE TABLE IF NOT EXISTS park_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timings jsonb NOT NULL DEFAULT '{"openTime": "10:00 AM", "closeTime": "5:00 PM", "days": "Monday - Sunday"}',
  prices jsonb NOT NULL DEFAULT '{"weekday": 400, "weekend": 500}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE park_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for park_settings
CREATE POLICY "Anyone can read park settings"
  ON park_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert park settings"
  ON park_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update park settings"
  ON park_settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for gallery_images
CREATE POLICY "Anyone can read gallery images"
  ON gallery_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert gallery images"
  ON gallery_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery images"
  ON gallery_images
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete gallery images"
  ON gallery_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default data
INSERT INTO park_settings (timings, prices) VALUES (
  '{"openTime": "10:00 AM", "closeTime": "5:00 PM", "days": "Monday - Sunday"}',
  '{"weekday": 400, "weekend": 500}'
) ON CONFLICT DO NOTHING;

-- Insert default gallery images
INSERT INTO gallery_images (image_url, display_order) VALUES 
  ('https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('https://images.pexels.com/photos/1630344/pexels-photo-1630344.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
  ('https://images.pexels.com/photos/1630344/pexels-photo-1630344.jpeg?auto=compress&cs=tinysrgb&w=800', 5),
  ('https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800', 6)
ON CONFLICT DO NOTHING;