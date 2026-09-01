import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type BadgeVariant = 'inline' | 'floating';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  className?: string;
  style?: ViewStyle;
}

function CheckIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path
        d="M2.5 6L5 8.5L9.5 4"
        stroke="#5E8C73"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Badge({
  children,
  variant = 'inline',
  className,
  style,
}: BadgeProps) {
  const isFloating = variant === 'floating';

  return (
    <View
      className={className}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: isFloating
            ? 'rgba(255,246,233,0.92)'
            : '#EEF5F0', // sage-50
        },
        style,
      ]}
    >
      <CheckIcon />
      <Text
        style={{
          fontFamily: 'DMSans-SemiBold',
          fontSize: 11,
          color: '#5E8C73', // sage-400
        }}
      >
        {children}
      </Text>
    </View>
  );
}
