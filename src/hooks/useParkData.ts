import { useState, useEffect } from 'react';
import { ParkSettings, getParkSettings, updateParkSettings as updateParkSettingsDB } from '../lib/supabase';

export const useParkData = () => {
  const [parkSettings, setParkSettings] = useState<ParkSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load park settings from Supabase
  const loadParkSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const settings = await getParkSettings();
      if (settings) {
        setParkSettings(settings);
      } else {
        // If no settings found, try to create default ones
        console.log('No park settings found, this might be the first run');
        setParkSettings(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load park settings';
      console.error('Error loading park settings:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update park settings
  const updateParkSettings = async (updates: Partial<Pick<ParkSettings, 'timings' | 'prices' | 'facilities'>>) => {
    try {
      if (!parkSettings) {
        throw new Error('No park settings loaded');
      }

      const updatedSettings = await updateParkSettingsDB(parkSettings.id, updates);
      
      if (updatedSettings) {
        setParkSettings(updatedSettings);
        return updatedSettings;
      } else {
        throw new Error('Failed to update settings');
      }
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