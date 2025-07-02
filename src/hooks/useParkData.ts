import { useState, useEffect } from 'react';
import { supabase, ParkSettings, GalleryItem, uploadFile, deleteFile } from '../lib/supabase';

export const useParkData = () => {
  const [parkSettings, setParkSettings] = useState<ParkSettings | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load park settings
  const loadParkSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('park_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setParkSettings(data);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          timings: {
            openTime: '10:00 AM',
            closeTime: '5:00 PM',
            days: 'Monday - Sunday'
          },
          prices: {
            weekday: 400,
            weekend: 500
          }
        };

        const { data: newSettings, error: createError } = await supabase
          .from('park_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (createError) throw createError;
        setParkSettings(newSettings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load park settings');
    }
  };

  // Load gallery items
  const loadGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      setGalleryItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery items');
    }
  };

  // Update park settings
  const updateParkSettings = async (settings: Partial<ParkSettings>) => {
    try {
      if (!parkSettings) return;

      const { data, error } = await supabase
        .from('park_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', parkSettings.id)
        .select()
        .single();

      if (error) throw error;
      setParkSettings(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  // Add gallery item from file
  const addGalleryFile = async (file: File) => {
    try {
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const fileUrl = await uploadFile(file);
      
      const maxOrder = galleryItems.length > 0 
        ? Math.max(...galleryItems.map(item => item.display_order))
        : 0;

      const { data, error } = await supabase
        .from('gallery_items')
        .insert([{
          file_url: fileUrl,
          file_name: file.name,
          file_type: fileType,
          display_order: maxOrder + 1
        }])
        .select()
        .single();

      if (error) throw error;
      setGalleryItems(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add file');
      throw err;
    }
  };

  // Add gallery item from URL
  const addGalleryUrl = async (url: string, type: 'image' | 'video') => {
    try {
      const maxOrder = galleryItems.length > 0 
        ? Math.max(...galleryItems.map(item => item.display_order))
        : 0;

      const { data, error } = await supabase
        .from('gallery_items')
        .insert([{
          file_url: url,
          file_name: `External ${type}`,
          file_type: type,
          display_order: maxOrder + 1
        }])
        .select()
        .single();

      if (error) throw error;
      setGalleryItems(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add URL');
      throw err;
    }
  };

  // Remove gallery item
  const removeGalleryItem = async (itemId: string) => {
    try {
      const item = galleryItems.find(item => item.id === itemId);
      if (!item) return;

      // Delete from storage if it's an uploaded file
      if (item.file_url.includes(supabase.supabaseUrl)) {
        try {
          await deleteFile(item.file_url);
        } catch (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
        }
      }

      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setGalleryItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item');
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadParkSettings(), loadGalleryItems()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    parkSettings,
    galleryItems,
    loading,
    error,
    updateParkSettings,
    addGalleryFile,
    addGalleryUrl,
    removeGalleryItem,
    refetch: () => Promise.all([loadParkSettings(), loadGalleryItems()])
  };
};