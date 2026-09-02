import { supabase } from './supabase';
import type { Pet } from './types';

interface FetchDeckParams {
  adopterId?: string;
  latitude: number;
  longitude: number;
  radiusKm?: number;
  species?: string | null;
  sizes?: string[] | null;
  ageMin?: number | null;
  ageMax?: number | null;
  limit?: number;
}

export interface DeckResult {
  pets: Pet[];
  error: string | null;
}

export async function fetchDeck({
  adopterId,
  latitude,
  longitude,
  radiusKm = 30,
  species = null,
  sizes = null,
  ageMin = null,
  ageMax = null,
  limit = 20,
}: FetchDeckParams): Promise<DeckResult> {
  const { data, error } = await supabase.rpc('get_swipe_deck', {
    p_user_id: adopterId ?? null,
    p_lat: latitude,
    p_lng: longitude,
    p_radius_km: radiusKm,
    p_species: species,
    p_sizes: sizes,
    p_age_min: ageMin,
    p_age_max: ageMax,
    p_limit: limit,
    p_offset: 0,
  });

  if (error) {
    // Surface the real cause instead of masking it as an empty deck — this is
    // the difference between "no animals nearby" and a broken query/permission.
    console.error('fetchDeck error:', error.message, error);
    return { pets: [], error: error.message };
  }

  return { pets: (data as Pet[]) ?? [], error: null };
}

export function formatAge(months: number): string {
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (remaining === 0) return `${years} yr`;
  return `${years} yr ${remaining} mo`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
