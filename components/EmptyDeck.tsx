import React from 'react';
import { View, Text } from 'react-native';
import { PawPrint } from 'lucide-react-native';
import { Button } from './ui';

interface EmptyDeckProps {
  onExpandRadius: () => void;
}

export function EmptyDeck({ onExpandRadius }: EmptyDeckProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
      }}
    >
      <PawPrint size={80} color="#FF9F73" strokeWidth={1.5} />

      <Text
        style={{
          fontFamily: 'Sora-Bold',
          fontSize: 22,
          color: '#1F1B2E',
          textAlign: 'center',
          marginTop: 24,
        }}
      >
        You have seen all the animals nearby
      </Text>

      <Text
        style={{
          fontFamily: 'DMSans',
          fontSize: 14,
          color: '#4D4458',
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 20,
        }}
      >
        Want to look a little further? More good ones are just outside your area.
      </Text>

      <Button
        onPress={onExpandRadius}
        style={{ marginTop: 28 }}
      >
        Expand your radius
      </Button>
    </View>
  );
}
