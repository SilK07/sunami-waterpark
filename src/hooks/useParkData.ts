import { useState, useEffect } from 'react';
import { supabase, ParkSettings, GalleryImage } from '../lib/supabase';

export const useParkData = () => {
  const [parkSettings, setParkSettings] = useState<ParkSettings | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
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

  // Load gallery images
  const loadGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      setGalleryImages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery images');
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

  // Add gallery image
  const addGalleryImage = async (imageUrl: string) => {
    try {
      const maxOrder = galleryImages.length > 0 
        ? Math.max(...galleryImages.map(img => img.display_order))
        : 0;

      const { data, error } = await supabase
        .from('gallery_images')
        .insert([{
          image_url: imageUrl,
          display_order: maxOrder + 1
        }])
        .select()
        .single();

      if (error) throw error;
      setGalleryImages(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add image');
      throw err;
    }
  };

  // Remove gallery image
  const removeGalleryImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      setGalleryImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove image');
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadParkSettings(), loadGalleryImages()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    parkSettings,
    galleryImages,
    loading,
    error,
    updateParkSettings,
    addGalleryImage,
    removeGalleryImage,
    refetch: () => Promise.all([loadParkSettings(), loadGalleryImages()])
  };
};