import { useState, useEffect } from 'react';
import { supabase, ParkSettings } from '../lib/supabase';

export const useParkData = () => {
  const [parkSettings, setParkSettings] = useState<ParkSettings | null>(null);
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await loadParkSettings();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    parkSettings,
    loading,
    error,
    updateParkSettings,
    refetch: loadParkSettings
  };
};