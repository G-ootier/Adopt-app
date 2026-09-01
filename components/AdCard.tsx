import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { X } from 'lucide-react-native';

interface AdCardProps {
  onDismiss: () => void;
}

export function AdCard({ onDismiss }: AdCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;
  const cardHeight = cardWidth * 1.35;

  return (
    <View
      style={{
        width: cardWidth,
        height: cardHeight,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: '#1F1B2E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 28,
        elevation: 8,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ad label */}
      <View
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(31,27,46,0.06)',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            fontFamily: 'DMSans-Medium',
            fontSize: 10,
            color: '#9490A3',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Ad
        </Text>
      </View>

      {/* Dismiss button */}
      <Pressable
        onPress={onDismiss}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: 'rgba(31,27,46,0.06)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={16} color="#9490A3" />
      </Pressable>

      {/* Placeholder content for development */}
      <View style={{ alignItems: 'center', padding: 32 }}>
        <Text
          style={{
            fontFamily: 'DMSans-SemiBold',
            fontSize: 16,
            color: '#9490A3',
            textAlign: 'center',
          }}
        >
          Ad space
        </Text>
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 13,
            color: '#B0ACBB',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Native ad will display here in production builds
        </Text>
      </View>
    </View>
  );
}
