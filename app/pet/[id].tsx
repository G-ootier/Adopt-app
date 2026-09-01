import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Shield,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhotoCarousel } from '../../components/PhotoCarousel';
import { IconButton, Badge, Button } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { formatAge, formatDistance } from '../../lib/deck';
import type { Pet, Shelter } from '../../lib/types';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [pet, setPet] = useState<Pet | null>(null);
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data, error } = await supabase
        .from('pets')
        .select(
          `
          *,
          shelters:shelter_id (
            id,
            shelter_name,
            description,
            address,
            latitude,
            longitude,
            phone,
            email,
            website,
            social_links,
            is_verified
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error || !data) {
        console.warn('Pet detail fetch error:', error?.message);
        setIsLoading(false);
        return;
      }

      const shelterData = data.shelters as unknown as Shelter;
      setPet({
        ...data,
        shelter_name: shelterData?.shelter_name,
        shelter_address: shelterData?.address,
        shelter_latitude: shelterData?.latitude,
        shelter_longitude: shelterData?.longitude,
        shelter_is_verified: shelterData?.is_verified,
        shelter_phone: shelterData?.phone,
        shelter_email: shelterData?.email,
      } as Pet);
      setShelter(shelterData);
      setIsLoading(false);
    }

    load();
  }, [id]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF6E9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#FF7A4F" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF6E9',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            fontFamily: 'Sora-Bold',
            fontSize: 20,
            color: '#1F1B2E',
            textAlign: 'center',
          }}
        >
          Animal not found
        </Text>
        <Button
          variant="ghost"
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          Go back
        </Button>
      </View>
    );
  }

  // Build traits
  const traits: string[] = [];
  if (pet.breed) traits.push(pet.breed);
  if (pet.gender) traits.push(pet.gender === 'male' ? 'Male' : 'Female');
  if (pet.size)
    traits.push(pet.size.charAt(0).toUpperCase() + pet.size.slice(1));

  const speciesEmoji = pet.species === 'dog' ? '🐕' : '🐈';

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF6E9' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero photo section */}
        <View style={{ position: 'relative' }}>
          <PhotoCarousel photos={pet.photos ?? []} height={400} />

          {/* Top gradient for status bar legibility */}
          <LinearGradient
            colors={['rgba(31,27,46,0.5)', 'transparent']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
            pointerEvents="none"
          />

          {/* Back button */}
          <View
            style={{
              position: 'absolute',
              top: insets.top + 8,
              left: 16,
            }}
          >
            <IconButton
              onPress={() => router.back()}
              size={40}
              style={{ backgroundColor: 'rgba(255,246,233,0.85)' }}
            >
              <ChevronLeft size={22} color="#1F1B2E" />
            </IconButton>
          </View>

          {/* Verified badge */}
          {pet.shelter_is_verified && (
            <Badge
              variant="floating"
              style={{ position: 'absolute', bottom: 44, left: 20 }}
            >
              Verified
            </Badge>
          )}
        </View>

        {/* Bio sheet */}
        <View
          style={{
            marginTop: -28,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: '#FFF6E9',
            paddingHorizontal: 20,
            paddingTop: 28,
          }}
        >
          {/* Name + age */}
          <View
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}
          >
            <Text
              style={{
                fontFamily: 'Sora-ExtraBold',
                fontSize: 32,
                color: '#1F1B2E',
                letterSpacing: -0.64,
              }}
            >
              {pet.name}
            </Text>
            <Text
              style={{
                fontFamily: 'DMSans-Medium',
                fontSize: 18,
                color: '#4D4458',
              }}
            >
              {formatAge(pet.age_months)}
            </Text>
          </View>

          {/* Distance + shelter */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 6,
              gap: 4,
            }}
          >
            <MapPin size={14} color="#9490A3" />
            <Text
              style={{
                fontFamily: 'DMMono',
                fontSize: 12,
                color: '#9490A3',
              }}
            >
              {pet.distance_km != null ? formatDistance(pet.distance_km) : ''}
              {pet.distance_km != null && pet.shelter_name ? ' · ' : ''}
              {pet.shelter_name ?? ''}
              {pet.shelter_address ? `, ${pet.shelter_address}` : ''}
            </Text>
          </View>

          {/* Trait chips */}
          {traits.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 16,
              }}
            >
              {traits.map((trait) => (
                <View
                  key={trait}
                  style={{
                    backgroundColor: '#FFF0D9',
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'DMSans-Medium',
                      fontSize: 13,
                      color: '#1F1B2E',
                    }}
                  >
                    {trait}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Their story */}
          {pet.description && (
            <View style={{ marginTop: 28 }}>
              <Text
                style={{
                  fontFamily: 'Sora-Bold',
                  fontSize: 18,
                  color: '#1F1B2E',
                  marginBottom: 10,
                }}
              >
                Their story
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans',
                  fontSize: 14,
                  color: '#4D4458',
                  lineHeight: 14 * 1.55,
                }}
              >
                {pet.description}
              </Text>
            </View>
          )}

          {/* Stats grid */}
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 24,
            }}
          >
            {/* Species */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                padding: 14,
                alignItems: 'center',
                shadowColor: '#1F1B2E',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 22, marginBottom: 6 }}>
                {speciesEmoji}
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 10,
                  color: '#9490A3',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Species
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans-SemiBold',
                  fontSize: 14,
                  color: '#1F1B2E',
                  marginTop: 2,
                }}
              >
                {pet.species === 'dog' ? 'Dog' : 'Cat'}
              </Text>
            </View>

            {/* Breed */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                padding: 14,
                alignItems: 'center',
                shadowColor: '#1F1B2E',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 22, marginBottom: 6 }}>🐾</Text>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 10,
                  color: '#9490A3',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Breed
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans-SemiBold',
                  fontSize: 14,
                  color: '#1F1B2E',
                  marginTop: 2,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {pet.breed ?? 'Mixed'}
              </Text>
            </View>

            {/* Gender */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                padding: 14,
                alignItems: 'center',
                shadowColor: '#1F1B2E',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 22, marginBottom: 6 }}>
                {pet.gender === 'male' ? '♂' : '♀'}
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans-Medium',
                  fontSize: 10,
                  color: '#9490A3',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Gender
              </Text>
              <Text
                style={{
                  fontFamily: 'DMSans-SemiBold',
                  fontSize: 14,
                  color: '#1F1B2E',
                  marginTop: 2,
                }}
              >
                {pet.gender === 'male' ? 'Male' : 'Female'}
              </Text>
            </View>
          </View>

          {/* Meet the shelter card */}
          {shelter && (
            <View style={{ marginTop: 28 }}>
              <Text
                style={{
                  fontFamily: 'Sora-Bold',
                  fontSize: 18,
                  color: '#1F1B2E',
                  marginBottom: 12,
                }}
              >
                Meet the shelter
              </Text>

              <Pressable
                onPress={() => router.push(`/shelter/${shelter.id}`)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#1F1B2E',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {/* Shield icon */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#EEF5F0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Shield size={22} color="#5E8C73" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontFamily: 'Sora-Bold',
                      fontSize: 15,
                      color: '#1F1B2E',
                    }}
                    numberOfLines={1}
                  >
                    {shelter.shelter_name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'DMSans',
                      fontSize: 12,
                      color: '#9490A3',
                      marginTop: 2,
                    }}
                  >
                    {shelter.is_verified ? 'Verified' : 'Shelter'}
                    {' · responds in < 24h'}
                  </Text>
                </View>

                <ChevronRight size={20} color="#9490A3" />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom action bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <LinearGradient
          colors={['rgba(255,246,233,0)', 'rgba(255,246,233,1)']}
          style={{
            paddingTop: 24,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 28,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Later FAB */}
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#1F1B2E',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <X size={24} color="#1F1B2E" />
          </Pressable>

          {/* Primary CTA */}
          <Button
            variant="primary"
            size="lg"
            onPress={() => {
              // Will be wired up later for adoption request flow
              console.log('Meet request for', pet.name);
            }}
            style={{ flex: 1 }}
          >
            {`Yes, I want to meet ${pet.name}`}
          </Button>
        </LinearGradient>
      </View>
    </View>
  );
}
