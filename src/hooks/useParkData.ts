import { useState, useEffect } from 'react';
import { 
  ParkSettings, 
  getParkSettings, 
  updateParkSettings as updateParkSettingsStorage 
} from '../lib/localStorage';

export const useParkData = () => {
  const [parkSettings, setParkSettings] = useState<ParkSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load park settings from localStorage
  const loadParkSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate async operation for consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const settings = getParkSettings();
      setParkSettings(settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load park settings');
    } finally {
      setLoading(false);
    }
  };

  // Update park settings
  const updateParkSettings = async (settings: Partial<ParkSettings>) => {
    try {
      if (!parkSettings) return;

      const updatedSettings = updateParkSettingsStorage({
        ...parkSettings,
        ...settings
      });
      
      setParkSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  useEffect(() => {
    loadParkSettings();
  }, []);

  return {
    parkSettings,
    loading,
    error,
    updateParkSettings,
    refetch: loadParkSettings
  };
};