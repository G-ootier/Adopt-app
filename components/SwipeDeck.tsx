import React, { useCallback } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { SwipeCard } from './SwipeCard';
import { EmptyDeck } from './EmptyDeck';
import type { Pet } from '../lib/types';

const SWIPE_THRESHOLD = 100;
const FLY_DISTANCE = 600;
const FLY_DURATION = 280;
const SPRING_CONFIG = { stiffness: 300, damping: 28 };

interface SwipeDeckProps {
  pets: Pet[];
  onSwipeRight: (pet: Pet) => void;
  onSwipeLeft: (pet: Pet) => void;
  onExpandRadius: () => void;
  onTapDetail?: (pet: Pet) => void;
}

export function SwipeDeck({
  pets,
  onSwipeRight,
  onSwipeLeft,
  onExpandRadius,
  onTapDetail,
}: SwipeDeckProps) {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const commitSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (pets.length === 0) return;
      const pet = pets[0];
      if (direction === 'right') {
        onSwipeRight(pet);
      } else {
        onSwipeLeft(pet);
      }
    },
    [pets, onSwipeRight, onSwipeLeft],
  );

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (isAnimating.value) return;
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (isAnimating.value) return;

      if (e.translationX > SWIPE_THRESHOLD) {
        isAnimating.value = true;
        translateX.value = withTiming(
          FLY_DISTANCE,
          { duration: FLY_DURATION, easing: Easing.out(Easing.cubic) },
          () => {
            translateX.value = 0;
            isAnimating.value = false;
            runOnJS(commitSwipe)('right');
          },
        );
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        isAnimating.value = true;
        translateX.value = withTiming(
          -FLY_DISTANCE,
          { duration: FLY_DURATION, easing: Easing.out(Easing.cubic) },
          () => {
            translateX.value = 0;
            isAnimating.value = false;
            runOnJS(commitSwipe)('left');
          },
        );
      } else {
        // Snap back
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  // Top card animated style
  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${translateX.value / 16}deg` },
    ],
  }));

  // Next card animated style — scales up as top card moves away
  const nextCardStyle = useAnimatedStyle(() => {
    const progress = Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);
    return {
      transform: [
        { scale: 0.94 + progress * 0.06 },
        { translateY: 12 - progress * 12 },
      ],
      opacity: 0.7 + progress * 0.3,
    };
  });

  if (pets.length === 0) {
    return <EmptyDeck onExpandRadius={onExpandRadius} />;
  }

  const topPet = pets[0];
  const nextPet = pets.length > 1 ? pets[1] : null;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Next card (behind) */}
      {nextPet && (
        <Animated.View
          key={`next-${nextPet.id}`}
          style={[
            {
              position: 'absolute',
            },
            nextCardStyle,
          ]}
          pointerEvents="none"
        >
          <SwipeCard pet={nextPet} translateX={translateX} isTop={false} onTapDetail={onTapDetail} />
        </Animated.View>
      )}

      {/* Top card (interactive) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View key={`top-${topPet.id}`} style={topCardStyle}>
          <SwipeCard pet={topPet} translateX={translateX} isTop={true} onTapDetail={onTapDetail} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
