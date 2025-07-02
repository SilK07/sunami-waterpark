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
export const uploadFile = async (file: File, bucket: string = 'gallery'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteFile = async (url: string, bucket: string = 'gallery'): Promise<void> => {
  // Extract file path from URL
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    throw error;
  }
};