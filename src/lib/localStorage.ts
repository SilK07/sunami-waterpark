// Local storage utilities for park data management

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
  facilities: {
    lockerRoom: number;
    swimmingCostumes: number;
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

const STORAGE_KEYS = {
  PARK_SETTINGS: 'sunami_park_settings',
  GALLERY_ITEMS: 'sunami_gallery_items'
};

// Default data
const DEFAULT_PARK_SETTINGS: ParkSettings = {
  id: '1',
  timings: {
    openTime: '10:00 AM',
    closeTime: '5:00 PM',
    days: 'Monday - Sunday'
  },
  prices: {
    weekday: 400,
    weekend: 500
  },
  facilities: {
    lockerRoom: 50,
    swimmingCostumes: 100
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    file_url: '/1.jpeg',
    file_name: 'Water Park Experience 1',
    file_type: 'image',
    display_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    file_url: '/2.jpeg',
    file_name: 'Water Park Experience 2',
    file_type: 'image',
    display_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    file_url: '/3.jpeg',
    file_name: 'Water Park Experience 3',
    file_type: 'image',
    display_order: 3,
    created_at: new Date().toISOString()
  }
];

// Park Settings functions
export const getParkSettings = (): ParkSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PARK_SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading park settings from localStorage:', error);
  }
  
  // Return default and save it
  saveParkSettings(DEFAULT_PARK_SETTINGS);
  return DEFAULT_PARK_SETTINGS;
};

export const saveParkSettings = (settings: ParkSettings): void => {
  try {
    const updatedSettings = {
      ...settings,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.PARK_SETTINGS, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Error saving park settings to localStorage:', error);
    throw new Error('Failed to save park settings');
  }
};

export const updateParkSettings = (updates: Partial<ParkSettings>): ParkSettings => {
  const current = getParkSettings();
  const updated = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString()
  };
  saveParkSettings(updated);
  return updated;
};

// Gallery Items functions
export const getGalleryItems = (): GalleryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GALLERY_ITEMS);
    if (stored) {
      const items = JSON.parse(stored);
      return items.sort((a: GalleryItem, b: GalleryItem) => a.display_order - b.display_order);
    }
  } catch (error) {
    console.error('Error reading gallery items from localStorage:', error);
  }
  
  // Return default and save it
  saveGalleryItems(DEFAULT_GALLERY_ITEMS);
  return DEFAULT_GALLERY_ITEMS;
};

export const saveGalleryItems = (items: GalleryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GALLERY_ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving gallery items to localStorage:', error);
    throw new Error('Failed to save gallery items');
  }
};

export const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'created_at'>): GalleryItem => {
  const items = getGalleryItems();
  const newItem: GalleryItem = {
    ...item,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  
  const updatedItems = [...items, newItem];
  saveGalleryItems(updatedItems);
  return newItem;
};

export const updateGalleryItem = (id: string, updates: Partial<GalleryItem>): GalleryItem | null => {
  const items = getGalleryItems();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedItem = { ...items[index], ...updates };
  items[index] = updatedItem;
  saveGalleryItems(items);
  return updatedItem;
};

export const deleteGalleryItem = (id: string): boolean => {
  const items = getGalleryItems();
  const filteredItems = items.filter(item => item.id !== id);
  
  if (filteredItems.length === items.length) {
    return false; // Item not found
  }
  
  saveGalleryItems(filteredItems);
  return true;
};

// Clear all data (useful for testing)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PARK_SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.GALLERY_ITEMS);
};