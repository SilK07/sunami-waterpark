import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface ParkSettings {
  id: string;
  timings: {
    openTime: string;
    closeTime: string;
    days: string;
  };
  prices: {
    weekday: number;
    weekend: number;
  };
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  file_url: string;
  file_name: string;
  file_type: 'image' | 'video';
  display_order: number;
  created_at: string;
}

// Storage utilities
export const uploadFile = async (file: File): Promise<string> => {
  try {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      throw new Error('Please select an image or video file');
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum ${isImage ? '10MB' : '50MB'} allowed.`);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    
    // Create folder structure: images/ or videos/
    const folder = isImage ? 'images' : 'videos';
    const filePath = `${folder}/${fileName}`;

    console.log('Uploading file:', { fileName, filePath, size: file.size, type: file.type });

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extract file path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/gallery/images/filename.jpg
    const urlParts = url.split('/storage/v1/object/public/gallery/');
    if (urlParts.length < 2) {
      console.warn('Invalid storage URL format, skipping deletion:', url);
      return;
    }
    
    const filePath = urlParts[1];
    console.log('Deleting file:', filePath);

    const { error } = await supabase.storage
      .from('gallery')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log('File deleted successfully:', filePath);
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

// Test storage connection
export const testStorageConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from('gallery')
      .list('', { limit: 1 });

    if (error) {
      console.error('Storage connection test failed:', error);
      return false;
    }

    console.log('Storage connection successful');
    return true;
  } catch (error) {
    console.error('Storage connection error:', error);
    return false;
  }
};