import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { PawPrint } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CrushTile } from '../../components/CrushTile';
import { Chip, Button } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import type { Pet } from '../../lib/types';

type FilterOption = 'all' | 'waiting';

export default function CrushesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [crushes, setCrushes] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');

  const tileWidth = (width - 48) / 2;

  const loadCrushes = useCallback(async () => {
    if (!user) {
      setCrushes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from('swipes')
      .select(
        `
        pet_id,
        created_at,
        pets:pet_id (
          id,
          shelter_id,
          name,
          species,
          breed,
          age_months,
          gender,
          size,
          description,
          photos,
          status,
          created_at,
          updated_at
        )
      `,
      )
      .eq('adopter_id', user.id)
      .eq('direction', 'right')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('loadCrushes error:', error.message);
      setCrushes([]);
    } else {
      const pets = (data ?? [])
        .map((row: any) => row.pets as Pet)
        .filter(Boolean);
      setCrushes(pets);
    }

    setIsLoading(false);
  }, [user]);

  // Reload on tab focus
  useFocusEffect(
    useCallback(() => {
      loadCrushes();
    }, [loadCrushes]),
  );

  // Not logged in
  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF6E9',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <PawPrint size={80} color="#FF9D85" strokeWidth={1.4} />
        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 22,
            color: '#1F1B2E',
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          No crushes yet
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 14,
            color: '#9490A3',
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Sign up to start saving crushes.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <Button
            variant="primary"
            size="md"
            onPress={() => router.push('/(auth)/sign-up')}
          >
            Sign up
          </Button>
          <Button
            variant="tertiary"
            size="md"
            onPress={() => router.push('/(auth)/sign-in')}
          >
            Sign in
          </Button>
        </View>
      </View>
    );
  }

  const filteredCrushes =
    filter === 'waiting'
      ? crushes.filter((p) => p.status === 'available')
      : crushes;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFF6E9',
        paddingTop: insets.top + 12,
      }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 4 }}>
        <Text
          style={{
            fontFamily: 'Sora-ExtraBold',
            fontSize: 32,
            color: '#1F1B2E',
            letterSpacing: -0.64,
          }}
        >
          Crushes
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 13,
            color: '#9490A3',
            marginTop: 4,
          }}
        >
          {crushes.length} {crushes.length === 1 ? 'crush' : 'crushes'}
        </Text>
      </View>

      {/* Filter chips */}
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 20,
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <Chip active={filter === 'all'} onPress={() => setFilter('all')}>
          All
        </Chip>
        <Chip
          active={filter === 'waiting'}
          onPress={() => setFilter('waiting')}
        >
          Waiting
        </Chip>
      </View>

      {/* Content */}
      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color="#FF7A4F" />
        </View>
      ) : filteredCrushes.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <PawPrint size={80} color="#FF9D85" strokeWidth={1.4} />
          <Text
            style={{
              fontFamily: 'Sora-Bold',
              fontSize: 22,
              color: '#1F1B2E',
              marginTop: 20,
              textAlign: 'center',
            }}
          >
            No crushes yet
          </Text>
          <Text
            style={{
              fontFamily: 'DMSans',
              fontSize: 14,
              color: '#9490A3',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Start swiping.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCrushes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120,
          }}
          columnWrapperStyle={{ gap: 16, marginBottom: 16 }}
          renderItem={({ item }) => <CrushTile pet={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
