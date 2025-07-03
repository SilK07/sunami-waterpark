/*
  # Fix RLS policies for anonymous access

  1. Security Changes
    - Update park_settings policies to allow anonymous users to insert and update
    - Update gallery_items policies to allow anonymous users to insert, update, and delete
    - This allows the application to work with anonymous access while maintaining RLS

  Note: This configuration allows anonymous users to modify data. For production,
  consider implementing proper authentication and restricting these policies to authenticated users only.
*/

-- Drop existing restrictive policies for park_settings
DROP POLICY IF EXISTS "Authenticated users can insert park settings" ON park_settings;
DROP POLICY IF EXISTS "Authenticated users can update park settings" ON park_settings;

-- Create new policies for park_settings that allow anonymous access
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

-- Drop existing restrictive policies for gallery_items
DROP POLICY IF EXISTS "Authenticated users can insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can update gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can delete gallery items" ON gallery_items;

-- Create new policies for gallery_items that allow anonymous access
CREATE POLICY "Anyone can insert gallery items"
  ON gallery_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update gallery items"
  ON gallery_items
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete gallery items"
  ON gallery_items
  FOR DELETE
  TO public
  USING (true);