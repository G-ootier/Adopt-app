import React, { useState } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { Badge } from './ui';
import { formatAge, formatDistance } from '../lib/deck';
import type { Pet } from '../lib/types';

interface SwipeCardProps {
  pet: Pet;
  translateX: SharedValue<number>;
  isTop: boolean;
  onTapDetail?: (pet: Pet) => void;
}

const CARD_BORDER_RADIUS = 28;

export function SwipeCard({ pet, translateX, isTop, onTapDetail }: SwipeCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 32;
  const cardHeight = cardWidth * 1.35;

  const [photoIndex, setPhotoIndex] = useState(0);

  const photos =
    pet.photos && pet.photos.length > 0
      ? pet.photos.filter((p) => p && p.length > 0)
      : [];

  const displayPhotos =
    photos.length > 0
      ? photos
      : ['https://placehold.co/400x540/FFF6E9/FF7A4F?text=No+Photo'];

  // The top card renders every photo stacked so tapping between them is
  // instant (all decoded up front). Cards behind only need their first photo.
  const renderedPhotos = isTop ? displayPhotos : displayPhotos.slice(0, 1);

  const traits: string[] = [];
  if (pet.breed) traits.push(pet.breed);
  if (pet.gender) traits.push(pet.gender === 'male' ? 'Male' : 'Female');
  if (pet.size) traits.push(pet.size.charAt(0).toUpperCase() + pet.size.slice(1));
  const visibleTraits = traits.slice(0, 3);

  const crushStyle = useAnimatedStyle(() => {
    if (!isTop) return { opacity: 0 };
    return {
      opacity: interpolate(translateX.value, [0, 40, 100], [0, 0, 1], 'clamp'),
    };
  });

  const laterStyle = useAnimatedStyle(() => {
    if (!isTop) return { opacity: 0 };
    return {
      opacity: interpolate(translateX.value, [-100, -40, 0], [1, 0, 0], 'clamp'),
    };
  });

  return (
    <View
      style={{
        width: cardWidth,
        height: cardHeight,
        borderRadius: CARD_BORDER_RADIUS,
        overflow: 'hidden',
        backgroundColor: '#FFF6E9',
        shadowColor: '#1F1B2E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 6,
      }}
    >
      {/* Photos — stacked, visibility toggled by opacity for instant switching */}
      {renderedPhotos.map((uri, i) => (
        <Image
          key={uri + i}
          source={{ uri }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: '#FFF6E9',
            opacity: i === photoIndex ? 1 : 0,
          }}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
          priority={isTop && i === 0 ? 'high' : 'normal'}
        />
      ))}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(31,27,46,0.12)', 'transparent', 'rgba(31,27,46,0.85)']}
        locations={[0, 0.3, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Photo dots */}
      {photos.length > 1 && (
        <View style={{ position: 'absolute', top: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          {photos.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === photoIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === photoIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </View>
      )}

      {/* Tap zones for photo nav — only on top card */}
      {isTop && photos.length > 1 && (
        <>
          <Pressable
            onPress={() => setPhotoIndex((i) => Math.max(0, i - 1))}
            style={{ position: 'absolute', left: 0, top: 0, width: cardWidth * 0.3, height: cardHeight * 0.6 }}
          />
          <Pressable
            onPress={() => setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))}
            style={{ position: 'absolute', right: 0, top: 0, width: cardWidth * 0.3, height: cardHeight * 0.6 }}
          />
        </>
      )}

      {/* Verified badge top-left */}
      {pet.shelter_is_verified && (
        <Badge
          variant="floating"
          style={{ position: 'absolute', top: 16, left: 16 }}
        >
          Verified
        </Badge>
      )}

      {/* CRUSH stamp (right swipe) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 40,
            right: 24,
            transform: [{ rotate: '12deg' }],
            borderWidth: 4,
            borderColor: '#FF7A4F',
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 6,
            backgroundColor: 'rgba(255,255,255,0.85)',
          },
          crushStyle,
        ]}
      >
        <Text
          style={{
            fontFamily: 'Sora-ExtraBold',
            fontSize: 28,
            color: '#FF7A4F',
            letterSpacing: 2,
          }}
        >
          CRUSH
        </Text>
      </Animated.View>

      {/* LATER stamp (left swipe) */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 40,
            left: 24,
            transform: [{ rotate: '-12deg' }],
            borderWidth: 4,
            borderColor: '#1F1B2E',
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 6,
            backgroundColor: 'rgba(255,255,255,0.85)',
          },
          laterStyle,
        ]}
      >
        <Text
          style={{
            fontFamily: 'Sora-ExtraBold',
            fontSize: 22,
            color: '#1F1B2E',
            letterSpacing: 2,
          }}
        >
          LATER
        </Text>
      </Animated.View>

      {/* Bottom info overlay — tappable for detail */}
      <Pressable
        onPress={() => onTapDetail?.(pet)}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 20,
          paddingTop: 12,
        }}
      >
        {/* Name and age row */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text
            style={{
              fontFamily: 'Sora-ExtraBold',
              fontSize: 32,
              color: '#FFFFFF',
              letterSpacing: -0.64,
            }}
          >
            {pet.name}
          </Text>
          <Text
            style={{
              fontFamily: 'Sora-SemiBold',
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            {formatAge(pet.age_months)}
          </Text>
        </View>

        {/* Distance + shelter */}
        <Text
          style={{
            fontFamily: 'DMMono',
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 4,
          }}
        >
          {pet.distance_km != null ? formatDistance(pet.distance_km) : ''}
          {pet.distance_km != null && pet.shelter_name ? ' · ' : ''}
          {pet.shelter_name ?? ''}
        </Text>

        {/* Trait chips */}
        {visibleTraits.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {visibleTraits.map((trait) => (
              <View
                key={trait}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'DMSans-SemiBold',
                    fontSize: 11,
                    color: '#FFFFFF',
                  }}
                >
                  {trait}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </View>
  );
}
