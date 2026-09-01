import React from 'react';
import { Pressable, View, Text, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
}

const sizeConfig = {
  sm: { height: 36, paddingHorizontal: 14, fontSize: 13, borderRadius: 10 },
  md: { height: 48, paddingHorizontal: 18, fontSize: 15, borderRadius: 12 },
  lg: { height: 56, paddingHorizontal: 22, fontSize: 16, borderRadius: 14 },
} as const;

const variantStyles: Record<
  ButtonVariant,
  { bg: string; text: string; border?: string; shadow?: ViewStyle }
> = {
  primary: {
    bg: '#FF7A4F',
    text: '#FFFFFF',
    shadow: {
      shadowColor: '#FF7A4F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  secondary: {
    bg: '#1F1B2E',
    text: '#FFF6E9',
  },
  tertiary: {
    bg: 'transparent',
    text: '#1F1B2E',
    border: '#E5E3EA',
  },
  ghost: {
    bg: 'transparent',
    text: '#FF7A4F',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  leadingIcon,
  onPress,
  className,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const s = sizeConfig[size];
  const v = variantStyles[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      className={className}
      style={[
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          backgroundColor: v.bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: disabled ? 0.4 : 1,
          ...(v.border ? { borderWidth: 1.5, borderColor: v.border } : {}),
          ...(v.shadow ?? {}),
        },
        animatedStyle,
        style,
      ]}
    >
      {leadingIcon && <View>{leadingIcon}</View>}
      <Text
        style={{
          fontFamily: 'DMSans-SemiBold',
          fontSize: s.fontSize,
          color: v.text,
          letterSpacing: s.fontSize * -0.005,
        }}
      >
        {children}
      </Text>
    </AnimatedPressable>
  );
}
