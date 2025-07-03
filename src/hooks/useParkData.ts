import { useState, useEffect } from 'react';
import { supabase, ParkSettings, GalleryItem, uploadFile, deleteFile, testStorageConnection } from '../lib/supabase';

export const useParkData = () => {
  const [parkSettings, setParkSettings] = useState<ParkSettings | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  // Test storage connection on mount
  useEffect(() => {
    const checkStorage = async () => {
      const isReady = await testStorageConnection();
      setStorageReady(isReady);
      if (!isReady) {
        setError('Storage bucket not accessible. Please check your Supabase configuration.');
      }
    };
    checkStorage();
  }, []);

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
      if (!storageReady) {
        throw new Error('Storage is not ready. Please check your Supabase configuration.');
      }

      console.log('Starting file upload:', { name: file.name, size: file.size, type: file.type });
      
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const fileUrl = await uploadFile(file);
      
      console.log('File uploaded successfully, adding to database:', fileUrl);
      
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

      if (error) {
        console.error('Database insert error:', error);
        // Try to clean up uploaded file
        try {
          await deleteFile(fileUrl);
        } catch (cleanupError) {
          console.warn('Failed to cleanup uploaded file:', cleanupError);
        }
        throw error;
      }

      console.log('Gallery item added successfully:', data);
      setGalleryItems(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Add gallery file error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add file';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Add gallery item from URL
  const addGalleryUrl = async (url: string, type: 'image' | 'video') => {
    try {
      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new Error('Please enter a valid URL');
      }

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to add URL';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Remove gallery item
  const removeGalleryItem = async (itemId: string) => {
    try {
      const item = galleryItems.find(item => item.id === itemId);
      if (!item) return;

      // Delete from storage if it's an uploaded file (contains supabase URL)
      if (item.file_url.includes('supabase.co/storage')) {
        try {
          await deleteFile(item.file_url);
          console.log('File deleted from storage');
        } catch (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setGalleryItems(prev => prev.filter(item => item.id !== itemId));
      console.log('Gallery item removed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
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
    storageReady,
    updateParkSettings,
    addGalleryFile,
    addGalleryUrl,
    removeGalleryItem,
    refetch: () => Promise.all([loadParkSettings(), loadGalleryItems()])
  };
};