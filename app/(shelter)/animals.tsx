import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, PawPrint } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { PetGrid } from '../../components/PetGrid';
import { Button } from '../../components/ui';
import type { Pet } from '../../lib/types';

export default function AnimalsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('shelter_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setPets(data as Pet[]);
  }, [user]);

  useEffect(() => {
    fetchPets().finally(() => setLoading(false));
  }, [fetchPets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  }, [fetchPets]);

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

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF6E9' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A4F" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}
        >
          <Text
            style={{
              fontFamily: 'Sora-ExtraBold',
              fontSize: 32,
              color: '#1F1B2E',
            }}
          >
            My animals
          </Text>
        </View>

        {pets.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 80,
              paddingHorizontal: 40,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: '#EEF5F0',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <PawPrint size={30} color="#4A7560" />
            </View>
            <Text
              style={{
                fontFamily: 'Sora-Bold',
                fontSize: 18,
                color: '#1F1B2E',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              No animals yet
            </Text>
            <Text
              style={{
                fontFamily: 'DMSans',
                fontSize: 14,
                color: '#9490A3',
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              Start by adding your first animal to the platform.
            </Text>
            <Button
              variant="primary"
              size="md"
              onPress={() => router.push('/(shelter)/add-pet')}
              leadingIcon={<Plus size={18} color="#FFFFFF" />}
            >
              Add your first animal
            </Button>
          </View>
        ) : (
          <PetGrid
            pets={pets}
            onPressPet={(id) => router.push(`/(shelter)/edit-pet/${id}`)}
          />
        )}
      </ScrollView>

      {/* FAB */}
      {pets.length > 0 && (
        <Pressable
          onPress={() => router.push('/(shelter)/add-pet')}
          style={{
            position: 'absolute',
            bottom: insets.bottom + 90,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#FF7A4F',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#FF7A4F',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Plus size={26} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}
