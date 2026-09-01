import React from 'react';
import { Pressable, Text } from 'react-native';

interface ChipProps {
  children: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}

export function Chip({
  children,
  active = false,
  onPress,
  className,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={className}
      style={{
        backgroundColor: active ? '#FF7A4F' : '#FFFFFF',
        borderRadius: 999,
        paddingVertical: active ? 6 : 4.5,
        paddingHorizontal: active ? 12 : 10.5,
        ...(active
          ? {}
          : { borderWidth: 1.5, borderColor: '#E5E3EA' }),
      }}
    >
      <Text
        style={{
          fontFamily: 'DMSans-Medium',
          fontSize: 13,
          color: active ? '#FFFFFF' : '#1F1B2E',
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
