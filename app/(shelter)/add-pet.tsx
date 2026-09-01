import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { IconButton } from '../../components/ui';
import { PetForm } from '../../components/PetForm';

export default function AddPetScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: Parameters<React.ComponentProps<typeof PetForm>['onSubmit']>[0]) {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('pets').insert({
        shelter_id: user.id,
        name: data.name,
        species: data.species,
        breed: data.breed,
        size: data.size,
        age_months: data.age_months,
        gender: data.gender,
        description: data.description,
        photos: data.photos,
        status: data.status,
      });
      if (error) throw error;
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not save pet.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFF6E9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          }}
        >
          Add animal
        </Text>
      </View>

      <PetForm onSubmit={handleSubmit} isLoading={loading} />
    </KeyboardAvoidingView>
  );
}
