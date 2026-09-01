import React, { useRef, useState } from 'react';
import { View, ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';

interface PhotoCarouselProps {
  photos: string[];
  height?: number;
}

const PLACEHOLDER = 'https://placehold.co/400x540/FFF6E9/FF7A4F?text=No+Photo';

export function PhotoCarousel({ photos, height = 400 }: PhotoCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const images = photos.length > 0 ? photos : [PLACEHOLDER];

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setActiveIndex(index);
  };

  return (
    <View style={{ width, height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ width, height }}
            contentFit="cover"
            transition={200}
          />
        ))}
      </ScrollView>

      {/* Dot indicators */}
      {images.length > 1 && (
        <View
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {images.map((_, i) => (
            <View
              key={i}
              style={{
                width: activeIndex === i ? 20 : 8,
                height: 4,
                borderRadius: 2,
                backgroundColor:
                  activeIndex === i
                    ? 'rgba(255,255,255,1)'
                    : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
