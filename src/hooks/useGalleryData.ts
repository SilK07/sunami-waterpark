import { useState, useEffect } from 'react';
import { 
  GalleryItem, 
  getGalleryItems, 
  addGalleryItem as addGalleryItemStorage,
  updateGalleryItem as updateGalleryItemStorage,
  deleteGalleryItem as deleteGalleryItemStorage
} from '../lib/localStorage';

export const useGalleryData = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load gallery items from localStorage
  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate async operation for consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const items = getGalleryItems();
      setGalleryItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  // Add new gallery item
  const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at'>) => {
    try {
      const newItem = addGalleryItemStorage(item);
      setGalleryItems(prev => [...prev, newItem].sort((a, b) => a.display_order - b.display_order));
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add gallery item');
      throw err;
    }
  };

  // Update gallery item
  const updateGalleryItem = async (id: string, updates: Partial<GalleryItem>) => {
    try {
      const updatedItem = updateGalleryItemStorage(id, updates);
      if (updatedItem) {
        setGalleryItems(prev => 
          prev.map(item => item.id === id ? updatedItem : item)
            .sort((a, b) => a.display_order - b.display_order)
        );
        return updatedItem;
      }
      throw new Error('Gallery item not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gallery item');
      throw err;
    }
  };

  // Delete gallery item
  const deleteGalleryItem = async (id: string) => {
    try {
      const success = deleteGalleryItemStorage(id);
      if (success) {
        setGalleryItems(prev => prev.filter(item => item.id !== id));
        return true;
      }
      throw new Error('Gallery item not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gallery item');
      throw err;
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, []);

  return {
    galleryItems,
    loading,
    error,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    refetch: loadGalleryItems
  };
};