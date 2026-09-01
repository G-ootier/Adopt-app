import React from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { RotateCcw, X, Heart, Info } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FabProps {
  size: number;
  bgColor: string;
  iconColor: string;
  icon: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
}

function Fab({ size, bgColor, iconColor, icon, onPress, style }: FabProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: 999,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          // Card shadow
          shadowColor: '#1F1B2E',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        },
        animatedStyle,
        style,
      ]}
    >
      {icon}
    </AnimatedPressable>
  );
}

interface ActionFabsProps {
  onRewind: () => void;
  onLater: () => void;
  onCrush: () => void;
  onInfo: () => void;
}

export function ActionFabs({
  onRewind,
  onLater,
  onCrush,
  onInfo,
}: ActionFabsProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 16,
      }}
    >
      {/* Rewind */}
      <Fab
        size={44}
        bgColor="#FFFFFF"
        iconColor="#B98629"
        icon={<RotateCcw size={20} color="#B98629" />}
        onPress={onRewind}
      />

      {/* Later (X) */}
      <Fab
        size={56}
        bgColor="#FFFFFF"
        iconColor="#1F1B2E"
        icon={<X size={26} color="#1F1B2E" strokeWidth={2.5} />}
        onPress={onLater}
      />

      {/* Crush (Heart) */}
      <Fab
        size={68}
        bgColor="#FF7A4F"
        iconColor="#FFFFFF"
        icon={<Heart size={30} color="#FFFFFF" fill="#FFFFFF" />}
        onPress={onCrush}
        style={{
          // Coral glow
          shadowColor: '#FF7A4F',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 8,
        }}
      />

      {/* Info */}
      <Fab
        size={44}
        bgColor="#FFFFFF"
        iconColor="#1F1B2E"
        icon={<Info size={20} color="#1F1B2E" />}
        onPress={onInfo}
      />
    </View>
  );
}
