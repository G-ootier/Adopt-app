import React, { useEffect } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { Button } from './ui';
import type { Pet } from '../lib/types';

interface MatchOverlayProps {
  pet: Pet;
  isAuthenticated: boolean;
  onSayHi: () => void;
  onKeepSwiping: () => void;
  onCreateAccount: () => void;
}

export function MatchOverlay({
  pet,
  isAuthenticated,
  onSayHi,
  onKeepSwiping,
  onCreateAccount,
}: MatchOverlayProps) {
  const { width, height } = useWindowDimensions();
  const heartScale = useSharedValue(0.4);

  useEffect(() => {
    heartScale.value = withDelay(
      100,
      withSpring(1, {
        damping: 8,
        stiffness: 120,
        mass: 0.8,
      }),
    );
  }, []);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: 'rgba(31,27,46,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        zIndex: 100,
      }}
    >
      {/* Animated heart */}
      <Animated.View style={heartStyle}>
        <Heart size={80} color="#FF7A4F" fill="#FF7A4F" />
      </Animated.View>

      {/* Title */}
      <Text
        style={{
          fontFamily: 'Sora-ExtraBold',
          fontSize: 40,
          color: '#FFFFFF',
          marginTop: 24,
          textAlign: 'center',
        }}
      >
        It's a crush!
      </Text>

      {/* Body text */}
      {isAuthenticated ? (
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 15,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 12,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          {pet.name} is waiting at {pet.shelter_name ?? 'the shelter'}. Want to
          say hi?
        </Text>
      ) : (
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 15,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 12,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          Sign up to save your crushes
        </Text>
      )}

      {/* Buttons */}
      <View style={{ marginTop: 32, gap: 12, width: '100%' }}>
        {isAuthenticated ? (
          <>
            <Button onPress={onSayHi}>Say hi</Button>
            <Pressable
              onPress={onKeepSwiping}
              style={{ alignSelf: 'center', paddingVertical: 8 }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans-SemiBold',
                  fontSize: 15,
                  color: '#FFFFFF',
                }}
              >
                Keep swiping
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Button onPress={onCreateAccount}>Create account</Button>
            <Pressable
              onPress={onKeepSwiping}
              style={{ alignSelf: 'center', paddingVertical: 8 }}
            >
              <Text
                style={{
                  fontFamily: 'DMSans-SemiBold',
                  fontSize: 15,
                  color: '#FFFFFF',
                }}
              >
                Keep swiping
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Animated.View>
  );
}
