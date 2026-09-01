import React from 'react';
import { Pressable, View, Text, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { formatAge, formatDistance } from '../lib/deck';
import type { Pet } from '../lib/types';

interface CrushTileProps {
  pet: Pet;
}

const PLACEHOLDER = 'https://placehold.co/300x400/FFF6E9/FF7A4F?text=No+Photo';

export function CrushTile({ pet }: CrushTileProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const tileWidth = (width - 48) / 2; // 16 padding each side + 16 gap
  const tileHeight = tileWidth * (4 / 3);

  const photo =
    pet.photos && pet.photos.length > 0 ? pet.photos[0] : PLACEHOLDER;

  return (
    <Pressable
      onPress={() => router.push(`/(adopter)/pet/${pet.id}`)}
      style={{
        width: tileWidth,
        height: tileHeight,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#FFF6E9',
        shadowColor: '#1F1B2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <Image
        source={{ uri: photo }}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        contentFit="cover"
        transition={200}
      />

      <LinearGradient
        colors={['transparent', 'rgba(31,27,46,0.7)']}
        locations={[0.4, 1]}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
        }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 12,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 18,
            color: '#FFFFFF',
          }}
          numberOfLines={1}
        >
          {pet.name}
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 11,
            color: 'rgba(255,255,255,0.75)',
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {formatAge(pet.age_months)}
          {pet.distance_km != null ? ` · ${formatDistance(pet.distance_km)}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}
