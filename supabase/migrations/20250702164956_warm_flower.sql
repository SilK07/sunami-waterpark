/*
  # Update Gallery Structure for Media Management

  1. New Tables
    - `gallery_items` - replaces gallery_images to support both images and videos
      - `id` (uuid, primary key)
      - `file_url` (text, file URL from storage or external)
      - `file_name` (text, original filename)
      - `file_type` (text, 'image' or 'video')
      - `display_order` (integer, for ordering)
      - `created_at` (timestamp)

  2. Storage
    - Create 'gallery' bucket for file uploads
    - Set up proper policies for public access

  3. Migration
    - Migrate existing gallery_images data to new structure
    - Clean up old table
*/

-- Create the new gallery_items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'video')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery_items
CREATE POLICY "Anyone can read gallery items"
  ON gallery_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert gallery items"
  ON gallery_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery items"
  ON gallery_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete gallery items"
  ON gallery_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Migrate existing data from gallery_images if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gallery_images') THEN
    INSERT INTO gallery_items (file_url, file_name, file_type, display_order, created_at)
    SELECT 
      image_url as file_url,
      'Gallery Image' as file_name,
      'image' as file_type,
      display_order,
      created_at
    FROM gallery_images
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert some default images if gallery_items is empty
INSERT INTO gallery_items (file_url, file_name, file_type, display_order) 
SELECT * FROM (VALUES 
  ('https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800', 'Water Slide Fun', 'image', 1),
  ('https://images.pexels.com/photos/1630344/pexels-photo-1630344.jpeg?auto=compress&cs=tinysrgb&w=800', 'Pool Activities', 'image', 2),
  ('https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800', 'Family Fun', 'image', 3)
) AS default_items(file_url, file_name, file_type, display_order)
WHERE NOT EXISTS (SELECT 1 FROM gallery_items);

-- Create storage bucket for gallery files (this will be handled by Supabase UI)
-- The bucket creation and policies will be set up through the Supabase dashboard

-- Drop the old gallery_images table if it exists and we've migrated the data
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gallery_images') THEN
--     DROP TABLE gallery_images;
--   END IF;
-- END $$;