import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { AdopterFilters } from './types';

const STORAGE_KEY = 'adopt_filters';

export const DEFAULT_FILTERS: Omit<AdopterFilters, 'adopter_id'> = {
  species: null,
  sizes: null,
  age_min: null,
  age_max: null,
  breeds: null,
  latitude: 48.8566,
  longitude: 2.3522,
  radius_km: 50,
};

export async function loadFilters(): Promise<Omit<AdopterFilters, 'adopter_id'>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FILTERS };
    return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_FILTERS };
  }
}

export async function saveFilters(
  filters: Omit<AdopterFilters, 'adopter_id'>,
): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (e) {
    console.warn('saveFilters error:', e);
  }
}

export async function syncFiltersToSupabase(
  filters: Omit<AdopterFilters, 'adopter_id'>,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('adopter_filters')
    .upsert(
      {
        adopter_id: userId,
        ...filters,
      },
      { onConflict: 'adopter_id' },
    );

  if (error) {
    console.warn('syncFiltersToSupabase error:', error.message);
  }
}

export async function loadFiltersFromSupabase(
  userId: string,
): Promise<Omit<AdopterFilters, 'adopter_id'> | null> {
  const { data, error } = await supabase
    .from('adopter_filters')
    .select('*')
    .eq('adopter_id', userId)
    .single();

  if (error || !data) return null;

  return {
    species: data.species,
    sizes: data.sizes,
    age_min: data.age_min,
    age_max: data.age_max,
    breeds: data.breeds,
    latitude: data.latitude,
    longitude: data.longitude,
    radius_km: data.radius_km,
  };
}
