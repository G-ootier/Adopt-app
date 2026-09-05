import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { IconButton } from '../../../components/ui';
import { PetForm } from '../../../components/PetForm';
import { track } from '../../../lib/analytics';
import { recordShelterAdoption, type AdoptionSource } from '../../../lib/adoptions';
import type { Pet } from '../../../lib/types';

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adoptPromptOpen, setAdoptPromptOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) setPet(data as Pet);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(
    data: Parameters<React.ComponentProps<typeof PetForm>['onSubmit']>[0],
  ) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pets')
        .update({
          name: data.name,
          species: data.species,
          breed: data.breed,
          size: data.size,
          age_months: data.age_months,
          gender: data.gender,
          description: data.description,
          photos: data.photos,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;

      // If this save is what marked the animal adopted, ask the one source
      // question before leaving. Otherwise just go back.
      const becameAdopted = data.status === 'adopted' && pet?.status !== 'adopted';
      if (becameAdopted) {
        track('adoption_marked', { pet_id: id });
        setAdoptPromptOpen(true);
      } else {
        router.back();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not update pet.');
    } finally {
      setSaving(false);
    }
  }

  async function answerAdoptionSource(source: AdoptionSource) {
    setAdoptPromptOpen(false);
    if (pet) {
      await recordShelterAdoption(id, pet.shelter_id, source);
      track('adoption_confirmed', { pet_id: id, source });
    }
    router.back();
  }

  function confirmDelete() {
    Alert.alert(
      'Delete animal',
      'Are you sure you want to delete this animal? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
    );
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id);
      if (error) throw error;
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not delete pet.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF6E9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#FF7A4F" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF6E9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: 'DMSans', fontSize: 15, color: '#9490A3' }}>
          Pet not found
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF6E9' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
        }}
      >
        <IconButton onPress={() => router.back()} size={40}>
          <ChevronLeft size={22} color="#1F1B2E" />
        </IconButton>
        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 18,
            color: '#1F1B2E',
            flex: 1,
          }}
        >
          Edit animal
        </Text>
      </View>

      <PetForm initialValues={pet} onSubmit={handleSubmit} isLoading={saving} />

      {/* Delete button */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <Pressable
          onPress={confirmDelete}
          disabled={deleting}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 14,
            opacity: deleting ? 0.5 : 1,
          }}
        >
          <Trash2 size={16} color="#C84D4D" />
          <Text
            style={{
              fontFamily: 'DMSans-SemiBold',
              fontSize: 15,
              color: '#C84D4D',
            }}
          >
            {deleting ? 'Deleting...' : 'Delete animal'}
          </Text>
        </Pressable>
      </View>

      {/* Adoption source prompt — shown when the animal is newly marked adopted */}
      {adoptPromptOpen && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(31,27,46,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 28,
          }}
        >
          <View style={{ width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24 }}>
            <Text style={{ fontFamily: 'Sora-Bold', fontSize: 20, color: '#1F1B2E' }}>
              {pet ? `${pet.name} found a home! 🎉` : 'Adopted! 🎉'}
            </Text>
            <Text style={{ fontFamily: 'DMSans', fontSize: 15, color: '#4D4458', marginTop: 8, lineHeight: 22 }}>
              Did the adopter find {pet ? pet.name : 'this animal'} through Adopt? This helps us measure our impact.
            </Text>

            <View style={{ marginTop: 20, gap: 10 }}>
              {([
                { source: 'yes' as AdoptionSource, label: 'Yes, through Adopt', primary: true },
                { source: 'no' as AdoptionSource, label: 'No, another way', primary: false },
                { source: 'unsure' as AdoptionSource, label: 'Not sure', primary: false },
              ]).map((opt) => (
                <Pressable
                  key={opt.source}
                  onPress={() => answerAdoptionSource(opt.source)}
                  style={{
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: 'center',
                    backgroundColor: opt.primary ? '#FF7A4F' : '#F2F1F4',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans-SemiBold',
                      fontSize: 15,
                      color: opt.primary ? '#FFFFFF' : '#1F1B2E',
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
