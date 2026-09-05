import { supabase } from './supabase';

// One row per animal owned by the calling shelter, aggregated server-side by the
// get_shelter_interest RPC. Individual crushers are never exposed.
export interface ShelterInterest {
  pet_id: string;
  name: string;
  status: string;
  photos: string[] | null;
  crush_total: number;
  crush_7d: number;
  days_listed: number;
}

export async function fetchShelterInterest(): Promise<{
  data: ShelterInterest[];
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('get_shelter_interest');
  if (error) {
    console.error('fetchShelterInterest error:', error.message);
    return { data: [], error: error.message };
  }
  return { data: (data as ShelterInterest[]) ?? [], error: null };
}
