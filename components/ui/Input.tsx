import React, { useState } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
}

export function Input({ label, error, onFocus, onBlur, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? '#C84D4D'
    : focused
      ? '#FF7A4F'
      : '#E5E3EA';

  const borderWidth = focused && !error ? 2 : 1;

  return (
    <View>
      {label && (
        <Text
          style={{
            fontFamily: 'DMSans-Medium',
            fontSize: 13,
            color: '#1F1B2E',
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="#A8A4B5"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={{
          height: 48,
          paddingHorizontal: 16,
          borderWidth,
          borderColor,
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          fontFamily: 'DMSans',
          fontSize: 15,
          color: '#1F1B2E',
        }}
        {...rest}
      />
      {error && (
        <Text
          style={{
            fontFamily: 'DMSans',
            fontSize: 13,
            color: '#C84D4D',
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
