import { supabase } from './supabase';

// Whether the shelter believes the adopter found this animal through Adopt.
export type AdoptionSource = 'yes' | 'no' | 'unsure';

/**
 * Records a shelter-side adoption confirmation. Forgiving by design: every field
 * except pet/shelter is optional, and the answer is treated as an estimate.
 */
export async function recordShelterAdoption(
  petId: string,
  shelterId: string,
  source: AdoptionSource,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('adoptions').insert({
    pet_id: petId,
    shelter_id: shelterId,
    source_confirmed_by_shelter: source,
    confirmed_at: new Date().toISOString(),
  });
  return { error: error?.message ?? null };
}
