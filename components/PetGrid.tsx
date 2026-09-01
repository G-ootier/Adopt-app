import React from 'react';
import { View, Text, Pressable, Image, FlatList, Dimensions } from 'react-native';
import type { Pet, PetStatus } from '../lib/types';

interface PetGridProps {
  pets: Pet[];
  onPressPet: (id: string) => void;
}

const STATUS_COLORS: Record<PetStatus, string> = {
  available: '#4A7560',
  reserved: '#D4A843',
  adopted: '#C84D4D',
};

const GAP = 12;
const HORIZONTAL_PAD = 20;
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - HORIZONTAL_PAD * 2 - GAP) / 2;

function PetCard({ pet, onPress }: { pet: Pet; onPress: () => void }) {
  const statusLabel = pet.status.charAt(0).toUpperCase() + pet.status.slice(1);

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: cardWidth,
        marginBottom: GAP,
      }}
    >
      <Image
        source={{ uri: pet.photos[0] }}
        style={{
          width: cardWidth,
          height: cardWidth,
          borderRadius: 12,
          backgroundColor: '#E5E3EA',
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
          paddingHorizontal: 2,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontFamily: 'DMSans-SemiBold',
            fontSize: 14,
            color: '#1F1B2E',
            flex: 1,
            marginRight: 6,
          }}
        >
          {pet.name}
        </Text>
        <View
          style={{
            backgroundColor: STATUS_COLORS[pet.status],
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              fontFamily: 'DMSans-SemiBold',
              fontSize: 10,
              color: '#FFFFFF',
            }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function PetGrid({ pets, onPressPet }: PetGridProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        paddingHorizontal: HORIZONTAL_PAD,
      }}
    >
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} onPress={() => onPressPet(pet.id)} />
      ))}
    </View>
  );
}
