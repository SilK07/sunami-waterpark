import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
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

// Database functions
export const getParkSettings = async (): Promise<ParkSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('park_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching park settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getParkSettings:', error);
    return null;
  }
};

export const updateParkSettings = async (
  id: string,
  updates: Partial<Pick<ParkSettings, 'timings' | 'prices' | 'facilities'>>
): Promise<ParkSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('park_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating park settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateParkSettings:', error);
    return null;
  }
};

export const createParkSettings = async (
  settings: Pick<ParkSettings, 'timings' | 'prices' | 'facilities'>
): Promise<ParkSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('park_settings')
      .insert([settings])
      .select()
      .single();

    if (error) {
      console.error('Error creating park settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createParkSettings:', error);
    return null;
  }
};